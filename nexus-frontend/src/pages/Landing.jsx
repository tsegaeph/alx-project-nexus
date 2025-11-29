import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/theme.css"; // Ensure the CSS above is pasted here
import "../styles/glass.css"; // Keep your original glass styles if needed
import NeonButton from "../components/NeonButton";

export default function Landing() {
  const nav = useNavigate();

  return (
    <div className="landing-container">
      {/* Ambient Background Mesh */}
      <div className="bg-glow glow-1"></div>
      <div className="bg-glow glow-2"></div>

      {/* Simple Navbar for Professional Look */}
      <nav className="navbar">
        <div className="brand-logo">NEXUS</div>
        <div style={{ color: "#94a3b8", fontSize: "0.9rem", cursor: "pointer" }}>
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

        {/* Right Side: Immersive 3D Visual */}
        <div className="hero-visual">
          <div className="visual-card glass-card">
            {/* PLACEHOLDER: Replace src with a transparent PNG of your product 
               or a Spline 3D export for maximum effect.
            */}
            
            <img 
              src="https://cdn3d.iconscout.com/3d/premium/thumb/virtual-reality-headset-4973688-4144206.png" 
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
    </div>
  );
}