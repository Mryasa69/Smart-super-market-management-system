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
import ShoppingCart from './components/pages/ShoppingCart';
import  Profile  from "./components/pages/Profile";
import ProfileEdit  from "./components/pages/ProfileEdit";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage onLogin={function (role: "admin" | "cashier" | "stock_manager"): void {
          throw new Error("Function not implemented.");
        } } />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/cart" element={<ShoppingCart />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/edit" element={<ProfileEdit />} />
        

        {/* Admin pages */}
        <Route path="/dashboard" element={<AdminDashboard userRole={null} onLogout={function (): void {
          throw new Error("Function not implemented.");
        } } />} />
        <Route path="/inventory" element={<InventoryManagement userRole={null} onLogout={function (): void {
          throw new Error("Function not implemented.");
        } } />} />
        <Route path="/suppliers" element={<SupplierManagement userRole={null} onLogout={function (): void {
          throw new Error("Function not implemented.");
        } } />} />
        <Route path="/pos" element={<POSSystem userRole={null} onLogout={function (): void {
          throw new Error("Function not implemented.");
        } } />} />
        <Route path="/employees" element={<EmployeeManagement userRole={null} onLogout={function (): void {
          throw new Error("Function not implemented.");
        } } />} />
        <Route path="/customers" element={<CustomerManagement userRole={null} onLogout={function (): void {
          throw new Error("Function not implemented.");
        } } />} />
        <Route path="/reports" element={<ReportsAnalytics userRole={null} onLogout={function (): void {
          throw new Error("Function not implemented.");
        } } />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
