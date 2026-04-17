import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "./components/pages/HomePage";
import LoginPage from "./components/pages/LoginPage";
import SignUpPage from "./components/pages/SignUpPage";

import AdminDashboard from "./components/pages/AdminDashboard";
import InventoryManagement from "./components/pages/InventoryManagement";
import SupplierManagement from "./components/pages/SupplierManagement";
import POSSystem from "./components/pages/POSSystem";
import EmployeeManagement from "./components/pages/EmployeeManagement";
import CustomerManagement from "./components/pages/CustomerManagement";
import ReportsAnalytics from "./components/pages/ReportsAnalytics";
import CustomerPortal from "./components/pages/CustomerPortal";

type UserRole = "admin" | "cashier" | "stock_manager" | "customer" | null;

function App() {
  const [userRole, setUserRole] = useState<UserRole>(null);

  // Load saved role on refresh
  useEffect(() => {
    const savedRole = localStorage.getItem("userRole") as UserRole | null;
    if (savedRole) {
      setUserRole(savedRole);
    }
  }, []);

  const handleLogin = (role: "admin" | "cashier" | "stock_manager" | "customer") => {
    setUserRole(role);
    localStorage.setItem("userRole", role);
  };

  const handleLogout = () => {
    setUserRole(null);
    localStorage.removeItem("userRole");
    localStorage.removeItem("authToken");
    window.location.href = "/login";
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<HomePage onLogout={handleLogout} />} />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/signup" element={<SignUpPage />} />

        {/* Admin / dashboard pages */}
        <Route
          path="/dashboard"
          element={<AdminDashboard userRole={userRole} onLogout={handleLogout} />}
        />
        <Route
          path="/inventory"
          element={<InventoryManagement userRole={userRole} onLogout={handleLogout} />}
        />
        <Route
          path="/suppliers"
          element={<SupplierManagement userRole={userRole} onLogout={handleLogout} />}
        />
        <Route
          path="/pos"
          element={<POSSystem userRole={userRole} onLogout={handleLogout} />}
        />
        <Route
          path="/employees"
          element={<EmployeeManagement userRole={userRole} onLogout={handleLogout} />}
        />
        <Route
          path="/customers"
          element={<CustomerManagement userRole={userRole} onLogout={handleLogout} />}
        />
        <Route
          path="/reports"
          element={<ReportsAnalytics userRole={userRole} onLogout={handleLogout} />}
        />

        {/* Customer pages */}
        <Route
          path="/customer-portal"
          element={<CustomerPortal userRole={userRole} onLogout={handleLogout} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
