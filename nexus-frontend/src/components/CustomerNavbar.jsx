import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from "../api/axios";
import './CustomerNavbar.css';

export default function CustomerNavbar() {
  const [cartCount, setCartCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Sync input with URL on load (so text stays after refresh)
  useEffect(() => {
    const query = searchParams.get("search");
    if (query) setSearchTerm(query);
  }, [searchParams]);

  const fetchCartCount = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      const res = await axios.get("/cart/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Sum up quantities
      const count = res.data.results.reduce(
        (sum, item) => sum + (item.quantity || 1),
        0
      );
      setCartCount(count);
    } catch (err) {
      console.error("Failed to fetch cart count", err);
      setCartCount(0);
    }
  };

  useEffect(() => {
    fetchCartCount();
    const handler = () => fetchCartCount();
    window.addEventListener("cart_updated", handler);
    return () => window.removeEventListener("cart_updated", handler);
  }, []);

  // --- HANDLE SEARCH ---
  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      // Navigate to dashboard with query param
      navigate(`/customer/dashboard?search=${searchTerm}`);
      // Dispatch event to notify dashboard to refetch immediately if we are already there
      window.dispatchEvent(new CustomEvent("search_trigger", { detail: searchTerm }));
    }
  };

  return (
    <nav className="customer-navbar glass-panel">
      {/* 1. Logo Section */}
      <div className="navbar-left">
        <Link to="/customer/dashboard" style={{ textDecoration: 'none' }}>
          <h2 style={{ 
            color: '#abb0f1ff', 
            fontWeight: 700, 
            fontSize: "1.8rem", 
            letterSpacing: "1px",
            margin: 0,
            textShadow: "0 0 10px rgba(59, 130, 246, 0.6)"
          }}>
            NEXUS
          </h2>
        </Link>
      </div>

      {/* 2. Search Section (Glassy Input) */}
      <div className="navbar-center">
        <div className="search-wrapper">
          <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>
      </div>

      {/* 3. Actions Section (SVG Icons) */}
      <div className="navbar-right">
        <Link to="/customer/cart" className="navbar-icon-link">
          <div style={{ position: "relative" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </div>
          <span className="link-text">Cart</span>
        </Link>

        <Link to="/customer/profile" className="navbar-icon-link">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <span className="link-text">Orders</span>
        </Link>
      </div>
    </nav>
  );
}