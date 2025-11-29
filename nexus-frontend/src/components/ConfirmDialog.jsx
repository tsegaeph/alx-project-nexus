import React from "react";
export default function ConfirmDialog({ open, text, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", left: 0, top: 0, right: 0, bottom: 0,
      background: "rgba(22,28,40,0.32)", zIndex: 999,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        background: "rgba(32,46,71,0.98)", borderRadius: "12px",
        boxShadow: "0 6px 28px #09275388", padding: "2em 2.6em",
        minWidth: 320, color: "#fff", textAlign: "center"
      }}>
        <div style={{ marginBottom: "1.1em", fontSize: "1.18em" }}>{text}</div>
        <button style={{
          padding: "0.7em 2.1em", borderRadius: "9px",
          border: "none", background: "#1e2b44", color: "#fff",
          marginRight: "1.5em", fontWeight: "500", cursor: "pointer"
        }} onClick={onCancel}>Cancel</button>
        <button style={{
          padding: "0.7em 2.1em", borderRadius: "9px",
          border: "none", background: "#29cf7c", color: "#fff",
          fontWeight: "600", cursor: "pointer"
        }} onClick={onConfirm}>Confirm</button>
      </div>
    </div>
  );
}