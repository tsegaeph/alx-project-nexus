import React, { useState } from "react"; // 🔑 Import useState
import { useNavigate } from "react-router-dom";
import "../styles/theme.css"; 
import "../styles/glass.css"; 
import NeonButton from "../components/NeonButton";

export default function Landing() {
  const nav = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false); // 🔑 State to control modal

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="landing-container">
      {/* Ambient Background Mesh */}
      <div className="bg-glow glow-1"></div>
      <div className="bg-glow glow-2"></div>

      {/* Simple Navbar for Professional Look */}
      <nav className="navbar">
        <div className="brand-logo">NEXUS</div>
        <div 
          style={{ color: "#94a3b8", fontSize: "0.9rem", cursor: "pointer" }}
          onClick={openModal} // 🔑 Open modal on click
        >
          About Us
        </div>
      </nav>

      <div className="hero-wrapper">
        {/* Left Side: Text & CTA */}
        <div className="hero-content">
          <span className="hero-tagline">Future of Commerce</span>
          <h1 className="hero-title">
            Elevate Your <br /> Shopping Reality.
          </h1>
          <p className="hero-desc">
            Discover a curated collection of premium gear. 
            Seamlessly integrated, beautifully designed, and delivered 
            at the speed of light.
          </p>
          
          <div className="cta-group">
            <NeonButton onClick={() => nav("/auth?mode=signin")}>
              Sign In
            </NeonButton>
            <NeonButton onClick={() => nav("/auth?mode=signup")}>
              Get Started
            </NeonButton>
          </div>
        </div>

        <div className="hero-visual">
          <div className="visual-card glass-card">
            <img 
              src="/images/landing2.png" 
              alt="Futuristic Product" 
              className="visual-image"
            />
            
            {/* Floating UI Element decoration */}
            <div style={{
              marginTop: "1rem", 
              display: "flex", 
              justifyContent: "space-between",
              color: "rgba(255,255,255,0.7)",
              fontSize: "0.8rem"
            }}>
              <span>Processing...</span>
              <span style={{color: "#00f2ff"}}>• Live</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* 🔑 ABOUT US MODAL */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)', // Dark overlay
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="glass-card" style={{
            padding: '30px',
            maxWidth: '450px',
            width: '90%',
            borderRadius: '15px',
            position: 'relative',
            textAlign: 'center'
          }}>
            <button 
              onClick={closeModal} 
              style={{
                position: 'absolute',
                top: '10px',
                right: '15px',
                background: 'none',
                border: 'none',
                color: '#fff',
                fontSize: '1.5rem',
                cursor: 'pointer'
              }}
            >
              &times;
            </button>
            <h3 style={{ color: '#acc7ed', fontWeight: 600, marginBottom: '15px', fontSize: '1.4rem' }}>
              Project Showcase 🚀
            </h3>
            <p style={{ color: '#b3ccf7', lineHeight: '1.5', marginBottom: '25px' }}>
              This e-commerce platform was developed as the final project for the 
              **ALX Pro Dev Backend Program**.
            </p>
            <p style={{ color: '#b3ccf7', lineHeight: '1.5', marginBottom: '20px' }}>
              Through this project, I gained extensive experience in:
            </p>
            <ul style={{ color: '#a6bbfe', textAlign: 'left', listStyleType: 'none', paddingLeft: '20px' }}>
                <li style={{ marginBottom: '8px' }}>✅ Designing RESTful APIs with Python/Django.</li>
                <li style={{ marginBottom: '8px' }}>✅ Implementing Authentication, Permissions, and JWT.</li>
                <li style={{ marginBottom: '8px' }}>✅ Database management and Query Optimization.</li>
                <li style={{ marginBottom: '8px' }}>✅ Advanced filtering and search functionality.</li>
            </ul>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '30px' }}>
              A successful journey into professional backend development.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}