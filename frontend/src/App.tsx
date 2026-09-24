import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import AppSyncWrapper from "./AppWrapper";

// Public Experience
import PublicLayout from "./layouts/PublicLayout";
import PublicHome from "./pages/public/Home";
import PublicScan from "./pages/public/Scan";
import PublicRates from "./pages/public/Rates";
import PublicAccess from "./pages/public/Access";

// Collector Experience
import CollectorLayout from "./layouts/CollectorLayout";
import CollectorHome from "./pages/collector/Home";
import CreateLotWizard from "./pages/collector/CreateLot";
import Earnings from "./pages/collector/Earnings";
import Safety from "./pages/collector/Safety";
import PriceBoard from "./pages/collector/PriceBoard";
import SyncCenter from "./pages/collector/SyncCenter";
import ScanHandover from "./pages/collector/ScanHandover";
import ConfirmHandover from "./pages/collector/ConfirmHandover";
import History from "./pages/collector/History";
import HistoryDetail from "./pages/collector/HistoryDetail";
import CollectorRecyclers from "./pages/collector/Recyclers";
import CollectorLogin from "./pages/collector/Login";
import CollectorRegister from "./pages/collector/Register";
import { initSyncManager } from "./services/syncManager";

import CollectorGuard from "./components/CollectorGuard";

function App() {
  useEffect(() => {
    // Initialize the background sync manager orchestration
    initSyncManager();
  }, []);

  return (
    <AppSyncWrapper>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<PublicHome />} />
          <Route path="scan" element={<PublicScan />} />
          <Route path="rates" element={<PublicRates />} />
          <Route path="access" element={<PublicAccess />} />
        </Route>

        {/* Collector Standalone Auth Routes (Publicly accessible) */}
        <Route path="/collector/login" element={<CollectorLogin />} />
        <Route path="/collector/register" element={<CollectorRegister />} />

        {/* Collector Routes with Layout (Protected by CollectorGuard) */}
        <Route
          path="/collector"
          element={
            <CollectorGuard>
              <CollectorLayout />
            </CollectorGuard>
          }
        >
          <Route index element={<CollectorHome />} />
          <Route path="earnings" element={<Earnings />} />
          <Route path="sync" element={<SyncCenter />} />
          <Route path="history" element={<History />} />
        </Route>
        
        {/* Collector Standalone Action Routes (Protected by CollectorGuard) */}
        <Route
          path="/collector/create-lot"
          element={
            <CollectorGuard>
              <CreateLotWizard />
            </CollectorGuard>
          }
        />
        <Route
          path="/collector/safety"
          element={
            <CollectorGuard>
              <Safety />
            </CollectorGuard>
          }
        />
        <Route
          path="/collector/price"
          element={
            <CollectorGuard>
              <PriceBoard />
            </CollectorGuard>
          }
        />
        <Route
          path="/collector/recyclers"
          element={
            <CollectorGuard>
              <CollectorRecyclers />
            </CollectorGuard>
          }
        />
        <Route
          path="/collector/history/:lotId"
          element={
            <CollectorGuard>
              <HistoryDetail />
            </CollectorGuard>
          }
        />
        <Route
          path="/collector/scan"
          element={
            <CollectorGuard>
              <ScanHandover />
            </CollectorGuard>
          }
        />
        <Route
          path="/collector/handover/:id"
          element={
            <CollectorGuard>
              <ConfirmHandover />
            </CollectorGuard>
          }
        />
      </Routes>
    </AppSyncWrapper>
  );
}

export default App;
