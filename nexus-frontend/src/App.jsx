import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "react-hot-toast"; // optional, for better UI notifications

import Landing from "./pages/Landing";
import SignInSignUp from "./pages/SignInSignUp";

// Customer Pages
import CustomerDashboard from "./pages/customer/Dashboard";
import Cart from "./pages/customer/Cart";
import Profile from "./pages/customer/Profile";

// Seller Pages
import SellerDashboard from "./pages/seller/Dashboard";
import MyProducts from "./pages/seller/MyProducts";
import AddProduct from "./pages/seller/AddProduct";
import Categories from "./pages/seller/Categories";
import SellerOrders from "./pages/seller/SellerOrders";

// Simple role-based route guards
function ProtectedRoute({ children, role }) {
  const storedRole = localStorage.getItem("role");
  if (!storedRole) return <Navigate to="/auth" />;
  if (role && storedRole !== role) return <Navigate to="/" />;
  return children;
}

export default function App() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleTokenExpired = () => {
      // show notification
      if (toast) {
        toast.error("Your session expired. Please log in again.");
      } else {
        alert("Your session expired. Please log in again.");
      }

      // clear localStorage and redirect to login
      localStorage.clear();
      navigate("/auth");
    };

    // Listen to custom event dispatched by axios interceptor
    window.addEventListener("token-expired", handleTokenExpired);

    return () => {
      window.removeEventListener("token-expired", handleTokenExpired);
    };
  }, [navigate]);

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<SignInSignUp />} />

      {/* --- Customer Routes --- */}
      <Route path="/customer/dashboard" element={
        <ProtectedRoute role="customer">
          <CustomerDashboard />
        </ProtectedRoute>
      } />
      <Route path="/customer/cart" element={
        <ProtectedRoute role="customer">
          <Cart />
        </ProtectedRoute>
      } />
      <Route path="/customer/profile" element={
        <ProtectedRoute role="customer">
          <Profile />
        </ProtectedRoute>
      } />

      {/* --- Seller Routes --- */}
      <Route path="/seller/dashboard" element={
        <ProtectedRoute role="seller">
          <SellerDashboard />
        </ProtectedRoute>
      } />
      <Route path="/seller/orders" element={
        <ProtectedRoute role="seller">
          <SellerOrders />
        </ProtectedRoute>
      } />
      <Route path="/seller/products" element={
        <ProtectedRoute role="seller">
          <MyProducts />
        </ProtectedRoute>
      } />
      <Route path="/seller/add-product" element={
        <ProtectedRoute role="seller">
          <AddProduct />
        </ProtectedRoute>
      } />
      <Route path="/seller/categories" element={
        <ProtectedRoute role="seller">
          <Categories />
        </ProtectedRoute>
      } />
    </Routes>
  );
}
