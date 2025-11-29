import React, { useEffect, useState } from "react";
import SellerSidebar from "../../components/SellerSidebar";
import "../../styles/glass.css";
import "../../styles/theme.css";
import "../../styles/neon-button.css";
import axios from "../../api/axios";

export default function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/orders/my/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data || []);
    } catch (err) {
      console.error("Failed to fetch seller orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const markDelivered = async (orderId) => {
    if (!window.confirm("Mark this order as delivered?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`/orders/${orderId}/mark_delivered/`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchOrders(); // Refresh list
    } catch (err) {
      alert("Failed to update status");
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <SellerSidebar />
      <main style={{ marginLeft: 250, padding: "3em", width: "100%" }}>
        <h2 style={{ marginBottom: "0.5em", color: "#8cbcff" }}>Incoming Orders</h2>
        <p style={{ color: "#8cbcff", marginBottom: "2em" }}>Manage orders containing your products</p>

        {loading ? (
          <div>Loading...</div>
        ) : orders.length === 0 ? (
          <div className="glass-card" style={{ padding: "2em" }}>No active orders found.</div>
        ) : (
          <div style={{ display: "grid", gap: "1.5em" }}>
            {orders.map((order) => {
              // Determine seller-specific delivery status
              const allSellerDelivered = order.items.every(item => item.delivered);

              return (
                <div key={order.id} className="glass-card" style={{ padding: "1.5em" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1em" }}>
                    <h4 style={{ margin: 0 }}>Order #{order.id}</h4>
                    <span style={{ 
                      padding: "4px 12px", borderRadius: "12px", 
                      background: allSellerDelivered ? 'rgba(75, 223, 103, 0.2)' : 'rgba(247, 170, 0, 0.2)',
                      color: allSellerDelivered ? '#4bdf67' : '#f7aa00',
                      border: allSellerDelivered ? '1px solid #4bdf67' : '1px solid #f7aa00'
                    }}>
                      {allSellerDelivered ? 'delivered' : 'pending'}
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2em", marginBottom: "1.5em" }}>
                    {/* Customer Info */}
                    <div style={{ background: "rgba(0,0,0,0.2)", padding: "1em", borderRadius: "8px" }}>
                      <div style={{ color: "#8cbcff", marginBottom: "5px", fontSize: "0.9em" }}>CUSTOMER DETAILS</div>
                      <div><strong>Name:</strong> {order.customer_name}</div>
                      <div><strong>Phone:</strong> {order.phone}</div>
                      <div><strong>Address:</strong> {order.address}</div>
                    </div>

                    {/* Items Summary */}
                    <div style={{ background: "rgba(0,0,0,0.2)", padding: "1em", borderRadius: "8px" }}>
                      <div style={{ color: "#8cbcff", marginBottom: "5px", fontSize: "0.9em" }}>YOUR ITEMS</div>
                      {order.items.map((item) => (
                        <div key={item.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                          <span>{item.quantity}x {item.product.name}</span>
                          <span style={{ color: "#ccc" }}>
                            {item.delivered ? 'Delivered' : 'Pending'}
                          </span>
                        </div>
                      ))}
                      <div style={{ borderTop: "1px solid #444", marginTop: "10px", paddingTop: "5px" }}>
                        <strong>Total Items: {order.total_items}</strong>
                      </div>
                    </div>
                  </div>

                  {!allSellerDelivered && (
                    <button 
                      className="neon-btn" 
                      onClick={() => markDelivered(order.id)}
                      style={{ fontSize: "0.9em", padding: "0.8em 1.5em" }}
                    >
                      Mark as Delivered
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  );
}
