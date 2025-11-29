import React, { useEffect, useState } from "react";
import CustomerNavbar from "../../components/CustomerNavbar";
import { useNavigate } from "react-router-dom";
import "../../styles/glass.css";
import "../../styles/theme.css";
import "../../styles/neon-button.css";
import axios from "../../api/axios";

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [placing, setPlacing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
    window.addEventListener("cart_updated", fetchCart);
    return () => window.removeEventListener("cart_updated", fetchCart);
  }, []);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/cart/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const items = res.data.results || [];
      setCartItems(items);

      // Pre-fill phone from first item's seller_phone if available
      if (items.length > 0 && items[0].product.seller_phone) {
        setPhone(items[0].product.seller_phone);
      } else {
        setPhone("");
      }

    } catch (err) {
      console.error("Failed to fetch cart", err);
      setCartItems([]);
      setPhone("");
    }
  };

  const updateQuantity = async (id, delta) => {
    const item = cartItems.find((i) => i.id === id);
    if (!item) return;

    const newQuantity = Math.max(1, item.quantity + delta);

    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `/cart/${id}/`,
        { quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCart();
    } catch (err) {
      console.error("Failed to update quantity", err);
    }
  };

  const removeItem = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/cart/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCart();
      window.dispatchEvent(new Event("cart_updated"));
    } catch (err) {
      console.error("Failed to remove item", err);
    }
  };

  // --- Calculations using seller info from first cart item ---
  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.product.price) * (item.quantity || 1),
    0
  );

  const shipping = cartItems.length > 0 ? Number(cartItems[0].product.shipping_fee || 0) : 0;
  const taxRate = cartItems.length > 0 ? Number(cartItems[0].product.tax_rate || 0) : 0;
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + shipping + tax;

  const handlePlaceOrder = async () => {
    if (!phone.trim() || !address.trim())
      return alert("Phone and address are required");

    setPlacing(true);

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "/orders/",
        {
          phone: phone,
          address: address,
          total_price: total
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCartItems([]);
      setShowModal(false);
      window.dispatchEvent(new Event("cart_updated"));
      alert("Order placed successfully!");
      navigate("/customer/profile");

    } catch (err) {
      console.error("Failed to place order", err);
      alert("Failed to place order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div>
      <CustomerNavbar />

      <div className="container" style={{ minHeight: "90vh", marginLeft: "7em" , marginTop: "7em"}}>
        <h3 style={{ margin: "2em 0 1em 0", fontSize: "1.3em", color: "#6fa6ec" }}>Shopping Cart</h3>

        {cartItems.length === 0 ? (
          <div
            className="glass-card"
            style={{ width: 350, margin: "auto", textAlign: "center", padding: "2em" }}
          >
            Your cart is empty!
          </div>
        ) : (
          <div className="cart-container">
            <div className="cart-items">
              {cartItems.map((item) => (
                <div className="cart-item-row" key={item.id}>
                  <img
                    src={item.product.main_image || "https://via.placeholder.com/100"}
                    alt={item.product.name}
                    className="cart-item-image"
                  />
                  <div className="cart-item-details">
                    <div className="cart-item-title" style={{color: "#babdf0ff", fontWeight: "700"}}>{item.product.name}</div>
                    <div className="cart-item-desc" style={{color: "#babdf0ff"}}>{item.product.short_description || "No description"}</div>
                    <div className="cart-item-price">${Number(item.product.price).toFixed(2)}</div>
                  </div>
                  <div className="cart-item-qty">
                    <button onClick={() => updateQuantity(item.id, -1)}>-</button>
                    <span style={{color: "white"}}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                  </div>
                  <div style={{ width: 84, textAlign: "right", fontWeight: 700, color: "#38bdf8" }}>
                    ${(Number(item.product.price) * (item.quantity || 1)).toFixed(2)}
                  </div>
                  <button className="cart-item-remove" onClick={() => removeItem(item.id)} style={{fontSize: "2em"}}>
                    &#128465;
                  </button>
                </div>
              ))}
            </div>

            <div className="order-summary">
              <div style={{ fontWeight: 700, fontSize: "1.1em", marginBottom: "1em"}}>Order Summary</div>
              <div style={{marginBottom: "0.6em"}}>Subtotal <span style={{ float: "right" }}>${subtotal.toFixed(2)}</span></div>
              <div style={{marginBottom: "0.6em"}}>Shipping <span style={{ float: "right" }}>${shipping.toFixed(2)}</span></div>
              <div style={{marginBottom: "0.6em"}}>Tax ({taxRate}%) <span style={{ float: "right" }}>${tax.toFixed(2)}</span></div>
              <div style={{ fontWeight: 700, fontSize: "1.13em", margin: "18px 0 10px", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "10px" }}>
                Total <strong style={{ float: "right", color: "#6fa6ec" }}>${total.toFixed(2)}</strong>
              </div>

              <button className="neon-btn" style={{ width: "100%", marginTop: 19 }} onClick={() => setShowModal(true)}>
                Place Order
              </button>
              <button className="neon-btn" style={{ width: "100%", background: "transparent", border: "1px solid #38417c", marginTop: 9, color: "#bbb" }} onClick={() => window.history.back()}>
                ← Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1000,
          display: "flex", justifyContent: "center", alignItems: "center",
          backdropFilter: "blur(5px)"
        }}>
          <div className="glass-card" style={{ width: 420, padding: 30, borderRadius: 12, border: "1px solid #3254ad" }}>
            <h3 style={{ marginTop: 0, color: "#fff" }}>Delivery Details</h3>
            <p style={{ color: "#8cbcff", marginTop: 5, fontSize: "0.9em" }}>Where should we send your order?</p>

            <label style={{ display: "block", marginTop: 15, color: "#ccc" }}>Phone Number</label>
            <input
              type="text"
              value={phone || ""}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={phone || "+1 234 567 890"}
              style={{ width: "100%", padding: "10px", borderRadius: 8, marginTop: 5, background: "rgba(0,0,0,0.3)", border: "1px solid #444", color: "white" }}
            />

            <label style={{ display: "block", marginTop: 15, color: "#ccc" }}>Delivery Address</label>
            <textarea
              value={address || ""}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street, City, Building..."
              rows={3}
              style={{ width: "100%", padding: "10px", borderRadius: 8, marginTop: 5, background: "rgba(0,0,0,0.3)", border: "1px solid #444", color: "white" }}
            />

            <div style={{ display: "flex", gap: 15, marginTop: 25 }}>
              <button className="neon-btn" style={{ flex: 1, padding: "10px" }} onClick={handlePlaceOrder} disabled={placing}>
                {placing ? "Confirming..." : "Confirm Order"}
              </button>
              <button
                onClick={() => setShowModal(false)}
                style={{ flex: 1, padding: "10px", borderRadius: "8px", background: "transparent", border: "1px solid #555", color: "#ccc", cursor: "pointer" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
