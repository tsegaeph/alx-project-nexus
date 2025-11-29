import React, { useEffect, useState } from "react";
import CustomerNavbar from "../../components/CustomerNavbar";
import "../../styles/glass.css";
import "../../styles/theme.css";
import axios from "../../api/axios";

export default function CustomerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/orders/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data.results || res.data || []);
      } catch (err) {
        console.error("Failed to load orders", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div>
      <CustomerNavbar />
      <div className="container" style={{ padding: "2em 10em" , marginTop:"5em", }}>
        <h2 style={{ marginBottom: "1em", color: "#8cbcff", fontSize:"1.3em" }}>My Order History</h2>

        {loading ? (
          <div style={{ color: "white" }}>Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="glass-card" style={{ padding: "2em", textAlign: "center" }}>
            You haven't placed any orders yet.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5em" }}>
            {orders.map((order) => (
              <div key={order.id} className="glass-card" style={{ padding: "1.5em" }}>
                {/* Order Header */}
                <div style={{ 
                  display: "flex", justifyContent: "space-between", 
                  borderBottom: "1px solid rgba(255,255,255,0.1)", 
                  paddingBottom: "1em", marginBottom: "1em",
                  flexWrap: "wrap", gap: "10px"
                }}>
                  <div>
                    <div style={{ color: "#888", fontSize: "0.85em" }}>ORDER PLACED</div>
                    <div>{new Date(order.created_at).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div style={{ color: "#888", fontSize: "0.85em" }}>TOTAL</div>
                    <div style={{ fontWeight: "bold" }}>${Number(order.total).toFixed(2)}</div>
                  </div>
                  <div>
                    <div style={{ color: "#888", fontSize: "0.85em" }}>STATUS</div>
                    <div style={{ 
                      color: order.items.every(item => item.delivered) ? '#4bdf67' : '#f7aa00',
                      textTransform: "capitalize"
                    }}>
                      {order.items.every(item => item.delivered) ? 'delivered' : 'pending'}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: "#888", fontSize: "0.85em" }}>ORDER #</div>
                    <div>{order.id}</div>
                  </div>
                </div>

                {/* Order Items */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1em" }}>
                  {order.items.map((item) => (
                    <div key={item.id} style={{ display: "flex", gap: "1em", alignItems: "center" }}>
                      <img 
                        src={item.product.main_image || "https://via.placeholder.com/60"} 
                        alt={item.product.name} 
                        style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "6px" }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: "bold", fontSize: "1.1em" }}>{item.product.name}</div>
                        <div style={{ color: "#ccc", fontSize: "0.9em" }}>
                          Qty: {item.quantity} × ${item.price} — <span style={{ color: item.delivered ? '#4bdf67' : '#f7aa00' }}>
                            {item.delivered ? 'Delivered' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
