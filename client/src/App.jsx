import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import { HiOutlineMenu } from 'react-icons/hi';

import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import GenerateKeys from './pages/admin/GenerateKeys';
import AllKeys from './pages/admin/AllKeys';
import ManageStock from './pages/admin/ManageStock';
import UnbindRequests from './pages/admin/UnbindRequests';
import Settings from './pages/admin/Settings';
import RedeemPage from './pages/user/RedeemPage';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-950">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile header */}
          <div className="lg:hidden flex items-center gap-3 p-4 bg-gray-900 border-b border-gray-800">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-gray-400 hover:text-white rounded-lg"
            >
              <HiOutlineMenu className="w-6 h-6" />
            </button>
            <img src="/logo.png" alt="Spotify Gold" className="h-8 w-auto" />
          </div>
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" toastOptions={{
          style: { background: '#1f2937', color: '#fff', border: '1px solid #374151' }
        }} />
        <Routes>
          {/* User Pages */}
          <Route path="/" element={<RedeemPage />} />

          {/* Admin Pages */}
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="generate" element={<GenerateKeys />} />
            <Route path="keys" element={<AllKeys />} />
            <Route path="stock" element={<ManageStock />} />
            <Route path="unbind" element={<UnbindRequests />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
