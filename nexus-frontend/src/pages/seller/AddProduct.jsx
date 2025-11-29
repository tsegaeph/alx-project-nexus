import SellerSidebar from "../../components/SellerSidebar";
import NeonButton from "../../components/NeonButton";
import "../../styles/theme.css";
import "../../styles/glass.css";
import "../../styles/forms.css";
import { useEffect, useState } from "react";
import axios from "../../api/axios";

// Component for the required asterisk
const RequiredStar = () => <span style={{ color: 'red', marginLeft: '5px' }}>*</span>;

export default function AddProduct() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: "",
    short_description: "",
    description: "",
    category_id: "",
    price: "",
    stock_quantity: "",
    main_image: null,
    main_image_preview: "",
    images: [null, null, null],
    image_previews: ["", "", ""],
    weight: "",
    status: "Active",
    size: "",
    length: "",
    width: "",
    height: "",
    seller_phone: "",
    shipping_fee: "",
    tax_rate: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    axios
      .get("/categories/my/")
      .then((res) => {
        if (Array.isArray(res.data)) setCategories(res.data);
        else setCategories([]);
      })
      .catch((err) => {
        console.error("Failed to load categories:", err);
        setCategories([]);
      });
  }, []);

  function handleChange(e) {
    const { name, value, files } = e.target;

    if (files) {
      if (name === "main_image") {
        setForm((f) => ({
          ...f,
          main_image: files[0],
          main_image_preview: files[0] ? URL.createObjectURL(files[0]) : "",
        }));
      } else if (name.startsWith("image_")) {
        const idx = parseInt(name.split("_")[1], 10);
        const updatedImages = [...form.images];
        const updatedPreviews = [...form.image_previews];
        updatedImages[idx] = files[0];
        updatedPreviews[idx] = files[0] ? URL.createObjectURL(files[0]) : "";
        setForm((f) => ({ ...f, images: updatedImages, image_previews: updatedPreviews }));
      }
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }

    setError("");
    setSuccess("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.main_image) {
      setError("Main image is required.");
      return;
    }
    
    // Simple client-side check for mandatory fields (excluding optional and stock)
    if (!form.name || !form.short_description || !form.description || !form.category_id || !form.price) {
        setError("Please fill in all mandatory fields.");
        return;
    }


    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("short_description", form.short_description);
    fd.append("description", form.description);
    fd.append("category_id", form.category_id);
    fd.append("price", form.price);
    // Keep stock_quantity required for business logic/DB
    fd.append("stock_quantity", form.stock_quantity); 
    fd.append("status", form.status);
    
    // Optional fields check
    if (form.size) fd.append("size", form.size);
    if (form.weight) fd.append("weight", form.weight);

    // Dimensions
    const dimArray = [];
    if (form.length) dimArray.push(`${form.length}L`);
    if (form.width) dimArray.push(`${form.width}W`);
    if (form.height) dimArray.push(`${form.height}H`);
    if (dimArray.length > 0) fd.append("dimensions", dimArray.join(" x "));

    // Seller info fields (Mandatory fields for configuration but optional for product entry)
    if (form.seller_phone) fd.append("seller_phone", form.seller_phone);
    if (form.shipping_fee) fd.append("shipping_fee", form.shipping_fee);
    if (form.tax_rate) fd.append("tax_rate", form.tax_rate);

    // Images
    fd.append("main_image", form.main_image);
    form.images.forEach((img) => {
      if (img) fd.append("uploaded_images", img);
    });

    try {
      await axios.post("/products/", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess("Product added successfully!");
      setForm({
        name: "",
        short_description: "",
        description: "",
        category_id: "",
        price: "",
        stock_quantity: "",
        main_image: null,
        main_image_preview: "",
        images: [null, null, null],
        image_previews: ["", "", ""],
        weight: "",
        status: "Active",
        size: "",
        length: "",
        width: "",
        height: "",
        seller_phone: "",
        shipping_fee: "",
        tax_rate: "",
      });
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) setError(JSON.stringify(err.response.data));
      else setError("Failed to add product.");
    }
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <SellerSidebar />
      <main style={{ marginLeft: 250, padding: "3.2em 2em", width: "100%" }}>
        <h2 style={{ fontSize: "1.34em", marginBottom: "0.8em", color:"#92a4ce"}}>Add New Product</h2>
        <div style={{ color: "#b3ccf7", marginBottom: "2.1em", fontSize: "1em" }}>
          Create a new product listing for your store
        </div>
        <div className="glass-card" style={{ maxWidth: 850, margin: "0 auto", padding: "2.7em 2.7em" }}>
          
          {/* PRODUCT IMAGES */}
          <div style={{ marginBottom: "2.3em" }}>
            <h4 style={{ color: "#acc7ed", fontWeight: "500", marginBottom: "0.5em" }}>Product Images</h4>
            <div style={{ display: "flex", gap: "1.5em", alignItems: "center" }}>
              {/* Main image - Always mandatory */}
              <label style={{
                border: "2px dashed #3254ad",
                borderRadius: "13px",
                minHeight: "145px",
                width: "380px",
                background: "rgba(36,60,125,0.23)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "#b1bcde",
                fontSize: "1em",
                cursor: "pointer",
                position: "relative"
              }}>
                <div style={{ fontSize: "2em", marginBottom: "0.3em" }}>⤴️</div>
                <span>Click to upload main product image <RequiredStar /></span>
                <span style={{ fontSize: "0.9em", color: "#6fa6ec", marginTop: "0.2em" }}>PNG, JPG up to 10MB</span>
                <input name="main_image" type="file" accept="image/*" style={{ display: "none" }} onChange={handleChange} />
                {form.main_image_preview && (
                  <img src={form.main_image_preview} alt="Preview"
                    style={{
                      position: "absolute",
                      left: "50%",
                      transform: "translate(-50%, 10%)",
                      top: -17,
                      width: "15em",
                      height: "9em",
                      objectFit: "cover",
                      borderRadius: "8px",
                      border: "2px solid #35adff",
                      background: "#222"
                    }}
                  />
                )}
              </label>

              {/* Additional images */}
              <div style={{ display: "grid", gap: "1.1em", gridTemplateRows: "repeat(3, 1fr)" }}>
                {[0, 1, 2].map(i =>
                  <label key={i} style={{
                    border: "2px dashed #3254ad",
                    borderRadius: "13px",
                    height: "7em",
                    width: "14em",
                    background: "rgba(36,60,125,0.14)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#b1bcde",
                    cursor: "pointer",
                    position: "relative"
                  }}>
                    <span style={{ fontSize: "1.5em" }}>+</span>
                    <span style={{ fontSize: "0.85em", color: "#6fa6ec" }}>Additional image</span>
                    <input name={`image_${i}`} type="file" accept="image/*" style={{ display: "none" }} onChange={handleChange} />
                    {form.image_previews[i] && (
                      <img src={form.image_previews[i]} alt="Preview"
                        style={{
                          position: "absolute",
                          left: "50%",
                          top: 0,
                          transform: "translateX(-50%)",
                          width: "10em",
                          height: "7em",
                          objectFit: "cover",
                          borderRadius: "8px",
                          border: "2px solid #4bdf67",
                          background: "#222"
                        }}
                      />
                    )}
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* PRODUCT FORM */}
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2.2em", marginBottom: "1.5em" }}>
              {/* LEFT SIDE */}
              <div>
                <label>Product Name <RequiredStar /></label>
                <input name="name" type="text" value={form.name} onChange={handleChange} required />
                
                <label>Category <RequiredStar /></label>
                <select name="category_id" value={form.category_id} onChange={handleChange} required>
                  <option value="">
                    {categories.length === 0 ? "Please create category first" : "Select Category"}
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                
                <label>Price <RequiredStar /></label>
                <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} required />
                
                {/* Stock Quantity - Required in HTML but no * */}
                <label>Stock Quantity</label> 
                <input name="stock_quantity" type="number" min="0" value={form.stock_quantity} onChange={handleChange} required />
                
                <label>Seller Phone <RequiredStar /></label>
                <input name="seller_phone" type="text" value={form.seller_phone} onChange={handleChange} placeholder="+2519xxxxxxx" required />
                
                <label>Shipping Fee ($) <RequiredStar /></label>
                <input name="shipping_fee" type="number" min="0" step="0.01" value={form.shipping_fee} onChange={handleChange} required />
                
                <label>Tax Rate (%) <RequiredStar /></label>
                <input name="tax_rate" type="number" min="0" step="0.01" value={form.tax_rate} onChange={handleChange} required />
              </div>

              {/* RIGHT SIDE */}
              <div>
                <label>Short Description <RequiredStar /></label>
                <input name="short_description" type="text" value={form.short_description} onChange={handleChange} required />
                
                {/* Weight - Optional, no * */}
                <label>Weight (kg)</label>
                <input name="weight" type="number" min="0" step="0.01" value={form.weight} onChange={handleChange} />
                
                {/* Size - Optional, no * */}
                <label>Size (if clothes)</label>
                <input name="size" type="text" value={form.size} onChange={handleChange} />
                
                <div style={{ display: "flex", gap: "1em" }}>
                  <div style={{ width: "33%" }}>
                    {/* Dimensions - Optional, no * */}
                    <label>Length</label>
                    <input name="length" type="number" min="0" value={form.length} onChange={handleChange} />
                  </div>
                  <div style={{ width: "33%" }}>
                    <label>Width</label>
                    <input name="width" type="number" min="0" value={form.width} onChange={handleChange} />
                  </div>
                  <div style={{ width: "33%" }}>
                    <label>Height</label>
                    <input name="height" type="number" min="0" value={form.height} onChange={handleChange} />
                  </div>
                </div>
                
                <label style={{ marginTop: "1.2em" }}>Product Status <RequiredStar /></label>
                <div style={{ display: "flex", gap: "2em", alignItems: "center" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.6em" }}>
                    <input type="radio" name="status" value="Active" checked={form.status === "Active"} onChange={handleChange} required />
                    <span style={{ color: "#5aa4ff", fontWeight: 500 }}>In stock</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.6em" }}>
                    <input type="radio" name="status" value="Out of stock" checked={form.status === "Out of stock"} onChange={handleChange} required />
                    <span style={{ color: "#b4a7d9", fontWeight: 500 }}>Out of stock</span>
                  </label>
                </div>
              </div>
            </div>

            <label>Full Description <RequiredStar /></label>
            <textarea name="description" rows={3} value={form.description} onChange={handleChange} required />

            {error && <div style={{ color: "#f77", marginBottom: "1em" }}>{error}</div>}
            {success && <div style={{ color: "#29cf7c", marginBottom: "1em" }}>{success}</div>}

            <NeonButton style={{ marginTop: "1.8em", width: "30%" }}>Add Product</NeonButton>
          </form>
        </div>
      </main>
    </div>
  );
}