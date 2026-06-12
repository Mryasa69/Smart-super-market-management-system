import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

import HomePage from "./components/pages/HomePage";
import LoginPage from "./components/pages/LoginPage";
import SignUpPage from "./components/pages/SignUpPage";
import CustomerRegister from "./components/pages/CustomerRegister";
import CustomerLogin from "./components/pages/CustomerLogin";
import CustomerDashboard from "./components/pages/CustomerDashboard";

import AdminDashboard from "./components/pages/AdminDashboard";
import InventoryManagement from "./components/pages/InventoryManagement";
import SupplierManagement from "./components/pages/SupplierManagement";
import POSSystem from "./components/pages/POSSystem";
import EmployeeManagement from "./components/pages/EmployeeManagement";
import CustomerManagement from "./components/pages/CustomerManagement";
import ReportsAnalytics from "./components/pages/ReportsAnalytics";
import ShoppingCart from './components/pages/ShoppingCart';
import  Profile  from "./components/pages/Profile";
import ProfileEdit  from "./components/pages/ProfileEdit";
import { OrderDetails } from "./components/pages/OrderDetails";
import { OrderHistory } from "./components/pages/OrderHistory";
import { OrderSuccess } from "./components/pages/OrderSuccess";
import { apiService } from "./services/api";
import AboutUsPage from "./components/pages/AboutUsPage";
import ContactUsPage from "./components/pages/ContactUSPage";
import Products from "./components/pages/Products";
import ServicesPage from "./components/pages/ServicesPage";



function App() {
  const [userRole, setUserRole] = useState<'admin' | 'cashier' | 'stock_manager' | 'customer' | null>(null);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    if (apiService.isCustomerAuthenticated()) {
      setUserRole('customer');
      setIsLoading(false);
      return;
    }

    const staffToken = localStorage.getItem('token');
    const user = apiService.getStoredUser();
    if (staffToken && user?.role) {
      setUserRole(user.role);
    }

    setIsLoading(false);
  }, []);

  const handleLogin = (role: 'admin' | 'cashier' | 'stock_manager' | 'customer') => {
    setUserRole(role);
  };

  const isEmployeeRole = userRole === 'admin' || userRole === 'cashier' || userRole === 'stock_manager';

  const handleLogout = () => {
    // Clear all browser storage and logout
    apiService.logout();
    setUserRole(null);
    
    // Force hard redirect to login page
    window.location.replace('/login');
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/signup" element={<SignUpPage onLogin={handleLogin} />} />
        <Route path="/customer-register" element={<CustomerRegister onLogin={handleLogin} />} />
        <Route path="/customer-dashboard" element={
          apiService.isCustomerAuthenticated() ? <CustomerDashboard /> : <Navigate to="/login" />
        } />
        <Route path="/cart" element={<ShoppingCart />} />
        <Route path="/profile" element={
          userRole || apiService.isCustomerAuthenticated() ? <Profile /> : <Navigate to="/login" />
        } />
        <Route path="/profile/edit" element={
          userRole || apiService.isCustomerAuthenticated() ? <ProfileEdit /> : <Navigate to="/login" />
        } />
        <Route path="/orders/:orderId" element={<OrderDetails />} />
        <Route path="/orders" element={<OrderHistory />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/about" element={<AboutUsPage />} />
        <Route path="/contact" element={<ContactUsPage />} />
        <Route path="/products" element={<Products />} />
        <Route path="/services" element={<ServicesPage />} />

        {/* Protected pages */}
        <Route path="/dashboard" element={
          isEmployeeRole ? <AdminDashboard userRole={userRole} onLogout={handleLogout} /> :
          <Navigate to="/login" />
        } />
        <Route path="/inventory" element={
          isEmployeeRole ? <InventoryManagement userRole={userRole} onLogout={handleLogout} /> :
          <Navigate to="/login" />
        } />
        <Route path="/suppliers" element={
          isEmployeeRole ? <SupplierManagement userRole={userRole} onLogout={handleLogout} /> :
          <Navigate to="/login" />
        } />
        <Route path="/pos" element={
          isEmployeeRole ? <POSSystem userRole={userRole} onLogout={handleLogout} /> :
          <Navigate to="/login" />
        } />
        <Route path="/employees" element={
          isEmployeeRole ? <EmployeeManagement userRole={userRole} onLogout={handleLogout} /> :
          <Navigate to="/login" />
        } />
        <Route path="/customers" element={
          isEmployeeRole ? <CustomerManagement userRole={userRole} onLogout={handleLogout} /> :
          <Navigate to="/login" />
        } />
        <Route path="/reports" element={
          isEmployeeRole ? <ReportsAnalytics userRole={userRole} onLogout={handleLogout} /> :
          <Navigate to="/login" />
        } />
        
        {/* Catch-all route for unmatched paths */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  );
}

export default App;
