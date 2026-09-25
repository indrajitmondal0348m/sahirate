import type { OutboxEvent } from "@/types";
import { useSyncStore } from "@/stores/syncStore";
import { getApiUrl } from "@/config/api";

export interface ISyncTransport {
  sendEvent(event: OutboxEvent): Promise<void>;
}

class HttpSyncTransport implements ISyncTransport {
  async sendEvent(event: OutboxEvent): Promise<void> {
    const syncUrl = getApiUrl("/sync/events");
    console.log(`[SyncTransport] Transmitting event ${event.type} (${event.id}) to ${syncUrl}`);

    const shouldFail = useSyncStore.getState().failNextSync;
    if (shouldFail) {
      useSyncStore.getState().setFailNextSync(false);
      throw new Error("Simulated network failure from debug toggle");
    }

    try {
      const response = await fetch(syncUrl, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: event.id,
          event_id: event.id,
          type: event.type,
          idempotency_key: event.idempotency_key || event.id,
          created_at_local: event.created_at_local,
          payload: event.payload || {},
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Sync failed with server status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log(`[SyncTransport] Event successfully synced:`, data);
    } catch (err: any) {
      if (
        err.name === "TypeError" ||
        err.name === "NetworkError" ||
        err.message?.includes("Failed to fetch") ||
        err.message?.includes("NetworkError")
      ) {
        const netErr = new Error("Device is offline or server is unreachable");
        netErr.name = "NetworkError";
        throw netErr;
      }
      throw err;
    }
  }
}

export const syncTransport: ISyncTransport = new HttpSyncTransport();
