import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastProvider } from "./components/Toast.jsx";
import AppLayout from "./components/AppLayout.jsx";
import Scan from "./pages/Scan.jsx";
import LocationDetail from "./pages/LocationDetail.jsx";
import PartDetail from "./pages/PartDetail.jsx";
import TransactionForm from "./pages/TransactionForm.jsx";
import LocationsList from "./pages/admin/LocationsList.jsx";
import LocationsCreate from "./pages/admin/LocationsCreate.jsx";
import LocationsImport from "./pages/admin/LocationsImport.jsx";
import PartsList from "./pages/admin/PartsList.jsx";
import PartsCreate from "./pages/admin/PartsCreate.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import History from "./pages/History.jsx";
import Search from "./pages/Search.jsx";
import Login from "./pages/Login.jsx";
import ReorderList from "./pages/ReorderList.jsx";
import CostReport from "./pages/CostReport.jsx";
import TransferForm from "./pages/TransferForm.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Landing from "./pages/Landing.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route element={<AppLayout />}>
            <Route path="/scan" element={<Scan />} />
            <Route path="/location/:locationId" element={<LocationDetail />} />
            <Route path="/part/:partId" element={<PartDetail />} />
            <Route path="/part/:partId/transaction" element={<TransactionForm />} />
            <Route path="/transfer" element={<TransferForm />} />
            <Route path="/transfer/:partId" element={<TransferForm />} />
            <Route path="/search" element={<Search />} />
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/admin/locations" element={<LocationsList />} />
              <Route path="/admin/locations/create" element={<LocationsCreate />} />
              <Route path="/admin/locations/import" element={<LocationsImport />} />
              <Route path="/admin/parts" element={<PartsList />} />
              <Route path="/admin/parts/create" element={<PartsCreate />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/history" element={<History />} />
              <Route path="/reorder" element={<ReorderList />} />
              <Route path="/cost" element={<CostReport />} />
            </Route>
          </Route>
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}
