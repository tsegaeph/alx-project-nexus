import SellerSidebar from "../../components/SellerSidebar";
import NeonButton from "../../components/NeonButton";
import ConfirmDialog from "../../components/ConfirmDialog";
import "../../styles/theme.css";
import "../../styles/glass.css";
import { useEffect, useState, useCallback } from "react";
import axios from "../../api/axios";

export default function MyProducts() {
  const [products, setProducts] = useState([]);
  const [delId, setDelId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [prodToDelete, setProdToDelete] = useState(null);
  const [loading, setLoading] = useState(true);

  // Search input value state
  const [searchTerm, setSearchTerm] = useState("");
  // State that holds the term actually used for the API query
  const [activeSearchTerm, setActiveSearchTerm] = useState("");

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");

      const query = activeSearchTerm ? `?search=${activeSearchTerm}` : '';
      
      const res = await axios.get(`/products/my/${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const items = Array.isArray(res.data.results) ? res.data.results : [];

      setProducts(items);
    } catch (err) {
      console.log("Error fetching seller products:", err.response?.data || err.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [activeSearchTerm]);
  
  // Triggers API call only on component mount and when activeSearchTerm changes (via button click)
  useEffect(() => {
    loadProducts();
  }, [activeSearchTerm, loadProducts]); 

  function handleSearchClick() {
      // Sets the input value as the active search term, triggering the useEffect
      setActiveSearchTerm(searchTerm);
  }

  function handleDelete(id) {
    setDialogOpen(true);
    setDelId(id);
    setProdToDelete(products.find(p => p.id === id));
  }

  async function confirmDelete() {
    if (!delId) return;
    try {
      await axios.delete(`/products/${delId}/`);
      setProducts(prev => prev.filter(p => p.id !== delId));
    } catch (err) {
      console.log("Error deleting product:", err.response?.data || err.message);
    } finally {
      setDialogOpen(false);
    }
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <SellerSidebar />

      <main style={{ marginLeft: 250, padding: "3em 2em", width: "100%" }}>
        <h2 style={{ fontSize: "1.4em", marginBottom: "1.2em", color: "#b3ccf7" }}>My Products</h2>

        <div style={{ color: "#b3ccf7", marginBottom: "2em", fontSize: "1.05em" }}>
          Manage your product inventory
        </div>

        {/* Search Input and Button */}
        <div style={{ display: "flex", alignItems: "center", gap: "1em", marginBottom: "2em" }}>
          <input
            style={{
              width: "30em",
              height: "2.5em",
              background: "rgba(34,50,110,0.12)",
              color: "#fff",
              borderRadius: "2em",
              border: "1.5px solid #3242d8",
              padding: "0.9em 1.1em",
              fontSize: "1.07rem"
            }}
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => { 
                if (e.key === 'Enter') {
                    handleSearchClick();
                }
            }}
          />
          
          <NeonButton 
             onClick={handleSearchClick}
             style={{ height: '2.5em', padding: '0em 1.5em', borderRadius:'2rem', position: "relative", bottom: "0.5em"}}
          >
             Search
          </NeonButton>
        </div>

        {/* Table */}
        <div className="glass-card" style={{ padding: 0, borderRadius: "13px" }}>
          {loading ? (
            <div style={{ padding: "2em", textAlign: "center", color: "#8d98ae" }}>
              Loading products...
            </div>
          ) : products.length === 0 ? (
            <div style={{ padding: "2em", textAlign: "center", color: "#8d98ae" }}>
              {activeSearchTerm ? `No products found matching "${activeSearchTerm}".` : `No products added yet.`}
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
              <thead>
                <tr style={{ color: "#a6bbfe", fontWeight: "500", fontSize: "1em", textAlign: "left" }}>
                  <th style={{ padding: "1em 1.2em" }}>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {products.map(p => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #1b293e", background: "none" }}>
                    <td style={{ padding: "0.9em 1.2em" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "1em" }}>
                        <img
                          src={p.main_image || "https://via.placeholder.com/50x50"}
                          alt=""
                          style={{ borderRadius: "7px", width: 42, height: 42, objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: "600" }}>{p.name}</div>
                          <div style={{ color: "#c0bcf2", fontSize: "0.97em" }}>
                            {p.short_description}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>{p.category?.name || "—"}</td>

                    <td>${p.price ? parseFloat(p.price).toFixed(2) : "0.00"}</td>

                    <td>
                      <span
                        style={{
                          padding: "0.32em 1.02em",
                          borderRadius: "11px",
                          background: "#29ae61",
                          color: "#fff",
                          fontWeight: "600",
                          fontSize: "0.95em"
                        }}
                      >
                        Active
                      </span>
                    </td>

                    <td>
                      <span
                        style={{ cursor: "pointer", color: "#f77", fontWeight: "bold" }}
                        onClick={() => handleDelete(p.id)}
                      >
                        🗑️
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <ConfirmDialog
          open={dialogOpen}
          text={`Are you sure you want to delete "${prodToDelete?.name}"? This cannot be undone.`}
          onCancel={() => setDialogOpen(false)}
          onConfirm={confirmDelete}
        />
      </main>
    </div>
  );
}