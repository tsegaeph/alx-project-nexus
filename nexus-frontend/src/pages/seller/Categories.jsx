// src/pages/seller/Categories.jsx
import SellerSidebar from "../../components/SellerSidebar";
import NeonButton from "../../components/NeonButton";
import ConfirmDialog from "../../components/ConfirmDialog";
import "../../styles/theme.css";
import "../../styles/glass.css";
import "../../styles/forms.css";
import { useEffect, useState } from "react";
import axios from "../../api/axios";

const PREDEFINED_CATEGORIES = [
  "Electronics", "Fashion", "Home & Garden", "Sports", "Books", "Beauty", "Toys", "Other"
];

const ICONS = [
  { icon: "💻", label: "Electronics" },
  { icon: "👚", label: "Fashion" },
  { icon: "🏡", label: "Home & Garden" },
  { icon: "🏀", label: "Sports" },
  { icon: "📚", label: "Books" },
  { icon: "💄", label: "Beauty" },
  { icon: "🧸", label: "Toys" }
];

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  
  // 🔥 FIX: REMOVED is_active from initial state
  const [form, setForm] = useState({
    name: "Electronics", 
    customName: "",
    description: "",
    icon: ICONS[0].icon,
    // is_active: true // REMOVED
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [delId, setDelId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [catToDel, setCatToDel] = useState(null);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    const token = localStorage.getItem("token");
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      const catsRes = await axios.get("categories/my/", config);
      const catsData = Array.isArray(catsRes.data)
        ? catsRes.data
        : (catsRes.data.results || catsRes.data || []);
      setCategories(catsData);
    } catch (err) {
      console.error("Failed to load categories:", err);
      setCategories([]);
    }

    try {
      // NOTE: This endpoint products/my/ might return paginated results.
      const prodsRes = await axios.get("products/my/", config);
      const prodsData = Array.isArray(prodsRes.data)
        ? prodsRes.data
        : (prodsRes.data.results || prodsRes.data || []);
      setProducts(prodsData);
    } catch (err) {
      console.error("Failed to load products:", err);
      setProducts([]);
    }
  }

  function handleChange(e) {
    // 🔥 FIX: Removed type/checked logic for is_active
    const { name, value } = e.target;
    setError(""); 
    setSuccess("");

    setForm(f => ({
      ...f,
      [name]: value
    }));
  }

  function selectIcon(icon) {
    setForm(f => ({ ...f, icon }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    let catName = form.name === "Other" ? form.customName : form.name;
    if (!catName) { setError("Category name required."); return; }

    // 🔥 FIX: REMOVED is_active from API payload
    const data = {
      name: catName,
      description: form.description,
      icon: form.icon,
      // is_active: form.is_active // REMOVED
    };

    const token = localStorage.getItem("token");
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      await axios.post("categories/", data, config);
      setSuccess("Category created!");
      
      // Reset form to default state after successful creation
      // 🔥 FIX: REMOVED is_active from reset state
      setForm({
        name: "Electronics", // Resetting to the default value
        customName: "",
        description: "",
        icon: ICONS[0].icon,
        // is_active: true // REMOVED
      });

      await fetchAll();
    } catch (err) {
      console.error("Create category error:", err);
      // More specific error handling
      if (err.response?.status === 400 && err.response?.data?.name?.includes('already exists')) {
          setError("A category with this name already exists.");
      } else if (err.response?.status === 400) {
          setError("Invalid data submitted. Check fields.");
      } else {
          setError("Failed to create category.");
      }
    }
  }

  function handleDelete(id) {
    setDialogOpen(true);
    setDelId(id);
    setCatToDel(categories.find(c => c.id === id));
  }

  async function confirmDelete() {
    const token = localStorage.getItem("token");
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      await axios.delete(`categories/${delId}/`, config);
      await fetchAll();
    } catch (err) {
      console.error("Failed to delete category:", err);
      alert("Failed to delete category. Ensure no products are using it.");
    } finally {
      setDialogOpen(false);
      setDelId(null);
      setCatToDel(null);
    }
  }

  function sameId(a, b) {
    if (a == null || b == null) return false;
    return String(a) === String(b);
  }

  function catStats(cat) {
    if (!cat || !Array.isArray(products)) return { total: 0, active: 0 };

    const items = products.filter(p => {
      const c = p.category;
      if (!c) return false;
      // Handle both cases: category is an object {id, name} or just the ID (number)
      if (typeof c === "object") return sameId(c.id, cat.id);
      return sameId(c, cat.id);
    });

    return {
      total: items.length,
      active: items.filter(p => (p.stock_quantity || 0) > 0).length
    };
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <SellerSidebar />

      <main style={{ marginLeft: 250, padding: "3.2em 2em", width: "100%" }}>
        <h2 style={{ fontSize: "1.29em", marginBottom: "1.2em", color:"#92a4ce" }}>
          Categories Management
        </h2>
        <div style={{ color: "#b3ccf7", marginBottom: "2em", fontSize: "1em" }}>
          Organize your products with custom categories
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1.3fr 1fr",
          gap: "2.5em",
          marginBottom: "2.5em"
        }}>

          {/* CREATE CATEGORY */}
          <div className="glass-card" style={{ padding: "2em 2em" }}>
            <h4 style={{ color: "#acc7ed", fontWeight: "500", marginBottom: "0.7em" }}>
              Create New Category
            </h4>

            <form onSubmit={handleSubmit}>
              <label>Category Name</label>
              <select name="name" value={form.name} onChange={handleChange}>
                <option value="">Choose...</option>
                {PREDEFINED_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {form.name === "Other" &&
                <input
                  name="customName"
                  type="text"
                  placeholder="Enter your category"
                  value={form.customName}
                  onChange={handleChange}
                />
              }

              <label>Description</label>
              <textarea
                name="description"
                rows={2}
                placeholder="Category description"
                value={form.description}
                onChange={handleChange}
              />

              <label>Icon</label>
              <div style={{ display: "flex", gap: "1em", marginBottom: "1em" }}>
                {ICONS.map(item =>
                  <span
                    key={item.icon}
                    onClick={() => selectIcon(item.icon)}
                    style={{
                      fontSize: "1.5em",
                      cursor: "pointer",
                      background: form.icon === item.icon ? "#3264ee" : "#203366",
                      borderRadius: "6px",
                      padding: "0.5em 0.8em",
                      color: "#bcd0f0",
                      border: form.icon === item.icon ? "2px solid #38bdf8" : "none",
                    }}
                    title={item.label}
                  >
                    {item.icon}
                  </span>
                )}
              </div>

              {/* 🔥 FIX: REMOVED is_active SWITCH from the form */}
              {/*
              <label>Status</label>
              <div style={{ marginBottom: "0.4em" }}>
                <label style={{ color: "#cbd6f5", fontSize: "0.9em" }}>
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={form.is_active}
                    onChange={handleChange}
                    style={{ marginRight: "0.5em", position:"relative", top: "2em", right: "21em"}}
                  />
                  Active
                </label>
              </div>
              */}

              {error && <div style={{ color: "#f77", marginBottom: "1em" }}>{error}</div>}
              {success && <div style={{ color: "#29cf7c", marginBottom: "1em" }}>{success}</div>}

              <NeonButton style={{ marginTop: "1.4em", width: "30%", fontWeight: "500" }}>
                Create Category
              </NeonButton>
            </form>
          </div>

          {/* LIST CATEGORIES */}
          <div className="glass-card" style={{ padding: "2em" }}>
            <h4 style={{ color: "#acc7ed", fontWeight: "500", marginBottom: "0.7em" }}>
              Existing Categories
            </h4>

            <div>
              {categories.length > 0 ? categories.map(cat => {
                const stats = catStats(cat);

                return (
                  <div key={cat.id} style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.93em 0",
                    borderBottom: "1px solid #212c47"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1em" }}>
                      <span style={{
                        fontSize: "1.35em",
                        background: "#223366",
                        borderRadius: "6px",
                        padding: "0.36em 0.7em",
                        color: "#bdd2fa"
                      }}>{cat.icon || "📂"}</span>

                      <div>
                        <div style={{ fontWeight: "600" }}>{cat.name}</div>
                        <div style={{ color: "#c0bcf2", fontSize: "0.9em" }}>
                          {stats.total} products
                        </div>
                        {/* 🔥 FIX: The backend will default this field to TRUE if not sent. 
                                 We assume active status for display or remove this line.
                                 If the API sends it, we keep it for display.
                        <div style={{
                          color: cat.is_active ? "#29cf7c" : "#f77",
                          fontSize: "0.9em",
                          fontWeight: "500"
                        }}>
                          {cat.is_active ? "Active" : "Inactive"}
                        </div>
                        */}
                      </div>
                    </div>

                    <span
                      style={{
                        cursor: "pointer",
                        color: "#f77",
                        fontWeight: "bold",
                        fontSize: "1.08em"
                      }}
                      onClick={() => handleDelete(cat.id)}
                    >
                      🗑️
                    </span>
                  </div>
                );
              }) : (
                <div style={{ color: "#8d98ae", padding: "1em" }}>
                  No categories yet.
                </div>
              )}
            </div>
          </div>
        </div>

        <ConfirmDialog
          open={dialogOpen}
          text={`Are you sure you want to delete the category "${catToDel?.name}"?`}
          onCancel={() => setDialogOpen(false)}
          onConfirm={confirmDelete}
        />
      </main>
    </div>
  );
}