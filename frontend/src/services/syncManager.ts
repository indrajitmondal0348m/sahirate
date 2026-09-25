import { db } from '@/db/dexie';
import { syncTransport } from '@/services/syncTransport';
import { useSyncStore } from '@/stores/syncStore';
import type { Lot } from '@/types';
import { getApiUrl } from '@/config/api';

let isSyncManagerRunning = false;

function parseIsoDate(val?: string | null): string {
  if (!val) return new Date().toISOString();
  try {
    const cleaned = val.replace(' ', 'T');
    const d = new Date(cleaned);
    if (!isNaN(d.getTime())) return d.toISOString();
  } catch {}
  return new Date().toISOString();
}

/**
 * Recovers any events that were interrupted (stuck in 'syncing' state)
 * back to 'pending' on application startup.
 */
async function recoverInterruptedSyncs() {
  const interrupted = await db.outbox.where('sync_status').equals('syncing').toArray();
  if (interrupted.length > 0) {
    console.log(`[SyncManager] Recovering ${interrupted.length} interrupted sync events back to pending.`);
    await db.transaction('rw', db.outbox, async () => {
      for (const event of interrupted) {
        await db.outbox.update(event.id, { sync_status: 'pending' });
      }
    });
  }
}

/**
 * Core synchronization loop.
 * Fetches pending/failed events and safely processes them.
 */
export async function processOutbox() {
  // Prevent concurrent sync loops
  if (isSyncManagerRunning) return;
  if (!useSyncStore.getState().isOnline) return;

  isSyncManagerRunning = true;
  useSyncStore.getState().setIsSyncing(true);

  try {
    // Process one by one, sorting by creation date to guarantee order
    while (true) {
      if (!useSyncStore.getState().isOnline) break; // Halts if network drops or offline simulated

      // Fetch only the oldest pending/failed event without loading the whole queue
      const event = await db.outbox
        .orderBy('created_at_local')
        .filter(e => e.sync_status === 'pending' || e.sync_status === 'failed')
        .first();

      if (!event) break;

      // Mark as syncing
      await db.outbox.update(event.id, { sync_status: 'syncing' });

      try {
        await syncTransport.sendEvent(event);

        // Success: Update both outbox and parent entity atomically
        await db.transaction('rw', db.outbox, db.lots, async () => {
          await db.outbox.update(event.id, { sync_status: 'synced' });
          
          if (event.type === 'LOT_CREATED') {
            await db.lots.update(event.id, { sync_status: 'synced' });
          }
        });

      } catch (error: any) {
        if (error.name === 'NetworkError' || error.message?.includes('Failed to fetch')) {
          console.log(`[SyncManager] Network unavailable for event ${event.id}, reverting to pending.`);
          await db.outbox.update(event.id, { sync_status: 'pending' });
          useSyncStore.getState().setOnline(false);
        } else {
          // Failure: Mark as failed so it can be retried later
          console.error(`[SyncManager] Failed to sync event ${event.id}:`, error);
          await db.outbox.update(event.id, { sync_status: 'failed' });
        }
        // We break out of the loop on failure to avoid hammering the network
        break;
      }
    }
  } finally {
    isSyncManagerRunning = false;
    useSyncStore.getState().setIsSyncing(false);
  }
}

/**
 * Pulls lots, handovers, and payments from FastAPI server into local Dexie.
 * Enables seamless cross-device synchronization (phone <-> laptop <-> desktop).
 */
export async function pullRemoteData(): Promise<void> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return;
  if (!useSyncStore.getState().isOnline) return;

  try {
    // 1. Pull Lots
    const lotsRes = await fetch(getApiUrl('/lots'));
    if (lotsRes.ok) {
      const remoteLots: any[] = await lotsRes.json();
      if (Array.isArray(remoteLots) && remoteLots.length > 0) {
        // Collect outbox pending events to avoid overwriting dirty local changes
        const pendingOutbox = await db.outbox.toArray();
        const pendingIds = new Set(pendingOutbox.map((e) => e.id));

        await db.transaction('rw', db.lots, async () => {
          for (const bLot of remoteLots) {
            if (!bLot.id) continue;
            if (pendingIds.has(bLot.id)) continue;

            const existing = await db.lots.get(bLot.id);
            const extra = bLot.extra_data || {};
            const createdIso = parseIsoDate(bLot.created_at_local || bLot.synced_at);

            const mappedLot: Lot = {
              id: bLot.id,
              collector_id: bLot.collector_id,
              sync_status: 'synced',
              created_at_local: createdIso,
              status: bLot.status,
              accepted_by: bLot.accepted_by,
              accepted_at: bLot.accepted_at ? parseIsoDate(bLot.accepted_at) : undefined,
              recycler_verified_material: bLot.recycler_verified_material,
              recycler_weight_kg: bLot.recycler_weight_kg,
              extra_data: extra,
              payload: {
                collector_id: bLot.collector_id,
                material_id: bLot.material_id,
                approx_weight_kg: bLot.approx_weight_kg,
                estimated_value: bLot.estimated_value,
                asking_price: extra.asking_price ?? (existing?.payload?.asking_price || bLot.estimated_value),
                estimated_min: extra.estimated_min ?? existing?.payload?.estimated_min,
                estimated_max: extra.estimated_max ?? existing?.payload?.estimated_max,
                items: extra.items ?? existing?.payload?.items,
                extra_data: extra,
                photo_reference: bLot.photo_reference,
                latitude: bLot.latitude,
                longitude: bLot.longitude,
              },
            };

            await db.lots.put(mappedLot);
          }
        });
      }
    }

    // 2. Pull Handovers
    const handoversRes = await fetch(getApiUrl('/handovers'));
    if (handoversRes.ok) {
      const remoteHandovers: any[] = await handoversRes.json();
      if (Array.isArray(remoteHandovers) && remoteHandovers.length > 0) {
        await db.transaction('rw', db.handovers, async () => {
          for (const h of remoteHandovers) {
            if (!h.id) continue;
            await db.handovers.put(h);
          }
        });
      }
    }

    // 3. Pull Payments
    const paymentsRes = await fetch(getApiUrl('/payments'));
    if (paymentsRes.ok) {
      const remotePayments: any[] = await paymentsRes.json();
      if (Array.isArray(remotePayments) && remotePayments.length > 0) {
        await db.transaction('rw', db.payments, async () => {
          for (const p of remotePayments) {
            if (!p.id) continue;
            await db.payments.put(p);
          }
        });
      }
    }
    console.log('[SyncManager] Bidirectional sync completed successfully.');
  } catch (err) {
    console.warn('[SyncManager] Error pulling remote data:', err);
  }
}

/**
 * Performs full bidirectional synchronization: pushes outbox and pulls latest cloud records.
 */
export async function syncAll(): Promise<void> {
  await processOutbox();
  await pullRemoteData();
}

let initialized = false;

export function initSyncManager() {
  if (initialized) return;
  initialized = true;

  console.log('[SyncManager] Initializing bidirectional sync...');

  // 1. Recover interrupted syncs immediately
  recoverInterruptedSyncs().then(async () => {
    // 2. Attempt sync if already online
    if (navigator.onLine) {
      await syncAll();
    }
  });

  // 3. Setup network listeners
  window.addEventListener('online', async () => {
    console.log('[SyncManager] Network online detected. Starting sync...');
    useSyncStore.getState().setOnline(true);
    await syncAll();
  });

  window.addEventListener('offline', () => {
    console.log('[SyncManager] Network offline detected.');
    useSyncStore.getState().setOnline(false);
  });
}
