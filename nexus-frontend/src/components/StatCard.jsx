// src/components/StatCard.jsx

import React from 'react';
import '../styles/glass.css'; // Assuming glass.css has .glass-card

const StatCard = ({ icon, label, value, loading, color, size = '1.35em' }) => (
    <div 
        className="glass-card" 
        style={{ 
            minWidth: 200, 
            textAlign: "center", 
            padding: "1.8em",
            flex: 1, // Ensures they share space equally
            boxShadow: `0 4px 30px rgba(0, 0, 0, 0.1)`, // A bit more depth
            border: `1px solid ${color}33`,
        }}
    >
        <div style={{ fontSize: "2.5em", marginBottom: "0.5em" }}>{icon}</div>
        <div 
            style={{ 
                fontSize: size, 
                fontWeight: "bold", 
                color: color || "#b7e3ff" 
            }}
        >
            {loading ? <span style={{ opacity: 0.7 }}>...</span> : value}
        </div>
        <div 
            style={{ 
                marginTop: "0.7em", 
                color: "#92bbfa", 
                fontWeight: "500", 
                fontSize: "1.05em" 
            }}
        >
            {label}
        </div>
    </div>
);

export default StatCard;