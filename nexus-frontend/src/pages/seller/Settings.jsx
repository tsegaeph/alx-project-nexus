import SellerSidebar from "../../components/SellerSidebar";
import NeonButton from "../../components/NeonButton";
import "../../styles/theme.css";
import "../../styles/glass.css";
import "../../styles/forms.css";
import { useState, useEffect } from "react";
import axios from "../../api/axios";

export default function Settings() {
  const [form, setForm] = useState({
    store_name: "", store_url: "", contact_email: "",
    phone_number: "", currency: "USD", tax_rate: "", shipping_fee: "",
    email_notifications: false
  });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Load existing store info (could be a GET /store/settings/ etc.)
  useEffect(() => {
    // For demo, skip loading
    // TODO: load current settings from backend API here
  }, []);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    setError("");
    setSuccess("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    // TODO: POST/PATCH to backend for updating store settings
    try {
      // Example post: await axios.post("/store/settings/", form);
      setSuccess("Store settings updated!");
    } catch (err) {
      setError("Failed to update settings.");
    }
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <SellerSidebar />
      <main style={{ marginLeft: 250, padding: "3.2em 2em", width: "100%" }}>
        <h2 style={{ fontSize: "1.29em", marginBottom: "0.33em" }}>Store Settings</h2>
        <div style={{ color: "#b3ccf7", marginBottom: "2.1em", fontSize: "1.05em" }}>
          Manage your store preferences and configurations
        </div>
        <form onSubmit={handleSubmit}>
          <div className="glass-card" style={{ padding: "2em 2em", marginBottom: "2em" }}>
            <h4 style={{ color: "#acc7ed", fontWeight: "500", marginBottom: "0.75em" }}>Store Information</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2.1em" }}>
              <div>
                <label>Store Name</label>
                <input name="store_name" value={form.store_name} onChange={handleChange} placeholder="My Awesome Store" />
                <label>Store URL</label>
                <input name="store_url" value={form.store_url} onChange={handleChange} placeholder="my-awesome-store" />
              </div>
              <div>
                <label>Contact Email</label>
                <input name="contact_email" value={form.contact_email} onChange={handleChange} placeholder="contact@mystore.com" />
                <label>Phone Number</label>
                <input name="phone_number" value={form.phone_number} onChange={handleChange} placeholder="+1 (555) 123-4567" />
              </div>
            </div>
          </div>
          <div className="glass-card" style={{ padding: "2em 2em", marginBottom: "2em" }}>
            <h4 style={{ color: "#acc7ed", fontWeight: "500", marginBottom: "0.75em" }}>Business Settings</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2.1em" }}>
              <div>
                <label>Currency</label>
                <select name="currency" value={form.currency} onChange={handleChange}>
                  <option value="USD">USD - US Dollar</option>
                  <option value="ETB">ETB - Ethiopian Birr</option>
                </select>
              </div>
              <div>
                <label>Tax Rate (%)</label>
                <input name="tax_rate" type="number" min="0" step="0.01" value={form.tax_rate} onChange={handleChange} placeholder="8.25" />
              </div>
              <div>
                <label>Shipping Fee</label>
                <input name="shipping_fee" type="number" min="0" step="0.01" value={form.shipping_fee} onChange={handleChange} placeholder="$ 5.99" />
              </div>
            </div>
          </div>
          <div className="glass-card" style={{ padding: "2em 2em" }}>
            <h4 style={{ color: "#acc7ed", fontWeight: "500", marginBottom: "0.75em" }}>Notification Settings</h4>
            <div style={{ fontWeight: "500", fontSize: "1.06em", marginBottom: "1em" }}>
              <label style={{ display: "flex", gap: "0.75em", alignItems: "center" }}>
                <span>Email notification for orders and stock updates</span>
                <input type="checkbox" name="email_notifications" checked={form.email_notifications} onChange={handleChange}
                  style={{ width: "40px", height: "28px", accentColor: "#38bdf8" }} />
              </label>
              <span style={{ color: "#99bcff", fontSize: "0.95em" }}>
                We'll send email to the registered address when new order is placed or stock runs out.
              </span>
            </div>
          </div>
          {success && <div style={{ color: "#29cf7c", marginBottom: "1em" }}>{success}</div>}
          {error && <div style={{ color: "#f77", marginBottom: "1em" }}>{error}</div>}
          <NeonButton style={{ marginTop: "1.4em", width: "100%", fontWeight: "500" }}>
            Save Settings
          </NeonButton>
        </form>
      </main>
    </div>
  );
}