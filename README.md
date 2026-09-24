# SahiRate — Decentralized Offline Scrap Collection & Formal Recycling Chain

**SIH Problem Statement:** Kabadiwala Connect – Bringing the Informal Collector into the Formal Recycling Chain.

---

## 🏗️ Architecture Overview

The system consists of three coordinated tiers:

```text
┌─────────────────────────────────────────────────────────────┐
│                 FASTAPI BACKEND (Python)                    │
│   • Port: 8000 (app.main:app)                               │
│   • SQLite (sahirate.db) / PostgreSQL                       │
│   • State Machine & Handover Engine                         │
│   • Outbox Event Ingestion & Idempotency (/sync/events)     │
│   • Enterprise Admin & KYC Verification APIs                │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
┌──────────────────────────────┐    ┌──────────────────────────────┐
│  COLLECTOR APP (TWA / APK)   │    │  RECYCLER & ADMIN WEB PORTAL │
│         (frontend)           │    │         (frontendRA)         │
│  • Port: 5173                │    │  • Port: 5174                │
│  • Offline-First with Dexie  │    │  • Real-time Web Dashboard   │
│  • Local YOLO11 ONNX ML      │    │  • Direct REST API client    │
│  • Background Sync Outbox    │    │  • No local DB required      │
│  • Local audio guidance      │    │  • Multi-role Yard / Admin   │
│  • Ready for TWA APK build   │    │                              │
└──────────────────────────────┘    └──────────────────────────────┘
```

---

## 🚀 Quick Start Guide

### 1. Start the FastAPI Backend
```powershell
cd backend
.\venv\Scripts\uvicorn app.main:app --reload --port 8000
```
- Interactive Swagger API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Check: [http://localhost:8000/health](http://localhost:8000/health)

### 2. Start the Collector App (TWA / PWA)
```powershell
cd frontend
npm run dev
```
- URL: [http://localhost:5173/collector](http://localhost:5173/collector)
- **Features:**
  - Creates lots completely offline with Dexie IndexedDB.
  - Runs YOLO11 computer vision ML model in-browser via WebAssembly (`onnxruntime-web`).
  - Automatically syncs outbox queue to `http://localhost:8000/api/v1/sync/events` when online.
  - Collector can scan QR code to confirm handover payouts.
  - Free from Recycler and Admin dashboards (tailored for APK / TWA packaging).

### 3. Start the Recycler & Admin Web Portal
```powershell
cd frontendRA
npm run dev
```
- URL: [http://localhost:5174](http://localhost:5174)
- **Recycler Yard Portal:** [http://localhost:5174/recycler](http://localhost:5174/recycler)
  - Live available collector scrap lots.
  - Yard weigh-in scale verification.
  - Dynamic Handover QR code generation.
  - Payment settlement & receipts.
- **Admin & Governance Portal:** [http://localhost:5174/admin](http://localhost:5174/admin)
  - Real-time platform KPI statistics (MT volume, active collectors, verified yards).
  - Chain-of-custody transaction auditing.
  - Recycler PCB / Hazardous Waste license approval & rejection.
  - Fraud & weight discrepancy alerts.
  - Tamper-evident audit logs.

---

## 🧪 Testing

To run backend tests (covering sync idempotency, handover lifecycle, rates, and admin workflows):
```powershell
cd backend
.\venv\Scripts\pytest -v
```
All 5 test suites pass with 100% test coverage.
