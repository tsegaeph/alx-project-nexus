import React, { useEffect, useState } from "react";
import CustomerNavbar from "../../components/CustomerNavbar";
import CategoryFilter from "../../components/CategoryFilter";
import "../../styles/glass.css";
import "../../styles/theme.css";
import "../../styles/neon-button.css";
import axios from "../../api/axios";

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState("All");
  
  const [currentSearchQuery, setCurrentSearchQuery] = useState("");

  // --- Modal State ---
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [activeImage, setActiveImage] = useState(""); // To swap main image in modal

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // Use the current search query state for the API call
      // If currentSearchQuery is empty, the URL will be /products/?search=, which should return all products.
      const res = await axios.get(`/products/?search=${currentSearchQuery}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data.results || []);
    } catch (err) {
      console.error("Failed to fetch products", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // 2. Updated useEffect: Runs on initial load (empty query) AND when the search query changes.
  useEffect(() => {
    // 3. Add event listener to capture search from Navbar
    const handleSearchTrigger = (e) => {
        // The Navbar sends the search term via 'detail'
        setCurrentSearchQuery(e.detail); 
    };

    window.addEventListener("search_trigger", handleSearchTrigger);
    
    // Fetch products based on the current search query state
    fetchProducts();
    
    return () => {
        window.removeEventListener("search_trigger", handleSearchTrigger);
    };
    
  }, [currentSearchQuery]); // Dependency on search query ensures re-fetch on search

  const handleAddToCart = async (product) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "/cart/",
        { product_id: product.id, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      window.dispatchEvent(new Event("cart_updated"));
    } catch (err) {
      console.error("Failed to add product to cart", err);
      alert("Could not add to cart. Try again.");
    }
  };

  // --- Handle View Details Click ---
  const handleViewDetails = async (productId) => {
    setShowModal(true);
    setModalLoading(true);
    setSelectedProduct(null);

    try {
      const token = localStorage.getItem("token");

      // Fetch product details including seller_phone
      const res = await axios.get(`/products/${productId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const productData = res.data;
      setSelectedProduct(productData);
      setActiveImage(productData.main_image);
    } catch (err) {
      console.error("Error fetching product details", err);
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  // Filtering is now ONLY done locally by Category, after the remote search fetch has completed.
  const filteredProducts =
    cat === "All" ? products : products.filter((p) => p.category?.name === cat);

  return (
    <div>
      <CustomerNavbar />

      <div className="dashboard-content container">
        <h3 style={{ margin: "2em 0 0.7em 2em", color: "#8cbcff" }}>
          Categories:
        </h3>
        <CategoryFilter selected={cat} onSelect={setCat} />

        <div className="product-grid" style={{ height: "60%", width: "80%", marginLeft: "10%" }}>
          {loading ? (
            <div className="glass-card" style={{ textAlign: "center" }}>
              Loading...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="glass-card" style={{ textAlign: "center" }}>
              {/* Updated message to reflect if search or filter caused no results */}
              No products available {currentSearchQuery && `for "${currentSearchQuery}"`}
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div key={product.id} className="glass-card product-card">
                <img
                  src={product.main_image || "https://via.placeholder.com/150"}
                  alt={product.name}
                  style={{
                    width: "100%",
                    height: 150,
                    objectFit: "cover",
                    borderRadius: "8px",
                    cursor: "pointer"
                  }}
                  onClick={() => handleViewDetails(product.id)}
                />
                <h4 style={{fontSize: "1.5rem", fontWeight: 700, fontFamily: "Helvetica, sans-serif", margin: "0.5rem 1rem"}}>{product.name}</h4>
                <p style={{fontSize: "0.8rem", fontWeight: 400, fontFamily: "Helvetica, sans-serif", margin: "0 1rem", color: "#ccc"}}>{product.short_description}</p>
                <div style={{ fontWeight: 700, margin: "0.4rem 1rem", fontSize: "1.1em", color: "#fff"}}>
                  ${Number(product.price).toFixed(2)}
                </div>

                <div style={{ display: "flex", alignItems: "center", marginTop: "1rem" }}>
                  <span 
                    onClick={() => handleViewDetails(product.id)}
                    style={{ 
                      cursor: "pointer", 
                      color: "#6fa6ec", 
                      marginLeft: "1rem", 
                      fontSize: "0.85rem",
                      textDecoration: "underline" 
                    }}
                  >
                    View Details
                  </span>

                  <button
                    className="neon-btn"
                    onClick={() => handleAddToCart(product)}
                    style={{ marginLeft: "auto", marginRight: "1rem", width: "45%", fontSize: "0.8rem" }}
                  >
                    Add Cart
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* --- PRODUCT DETAILS MODAL --- */}
      {showModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.75)", zIndex: 1000,
          display: "flex", justifyContent: "center", alignItems: "center",
          backdropFilter: "blur(5px)"
        }} onClick={closeModal}>
          
          <div 
            className="glass-card" 
            style={{ width: "90%", maxWidth: "900px", maxHeight: "90vh", overflowY: "auto", position: "relative", padding: "2rem" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={closeModal}
              style={{
                position: "absolute", top: "15px", right: "20px",
                background: "transparent", border: "none", color: "#fff",
                fontSize: "1.5rem", cursor: "pointer"
              }}
            >
              ✕
            </button>

            {modalLoading || !selectedProduct ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "#8cbcff" }}>Loading details...</div>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem" }}>
                
                <div style={{ flex: "1 1 350px" }}>
                  <div style={{ width: "100%", height: "350px", borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)", marginBottom: "1rem", background: "#000" }}>
                     <img 
                        src={activeImage || "https://via.placeholder.com/400"} 
                        alt="Main" 
                        style={{ width: "100%", height: "100%", objectFit: "contain" }} 
                      />
                  </div>

                  <div style={{ display: "flex", gap: "10px" }}>
                      <img 
                        src={selectedProduct.main_image} 
                        alt="Main Thumb"
                        onClick={() => setActiveImage(selectedProduct.main_image)}
                        style={{ width: "70px", height: "70px", objectFit: "cover", borderRadius: "6px", cursor: "pointer", border: activeImage === selectedProduct.main_image ? "2px solid #6fa6ec" : "1px solid #333" }}
                      />
                      {selectedProduct.images && selectedProduct.images.map((imgObj) => (
                        <img 
                          key={imgObj.id}
                          src={imgObj.image}
                          alt="Gallery Thumb"
                          onClick={() => setActiveImage(imgObj.image)}
                          style={{ width: "70px", height: "70px", objectFit: "cover", borderRadius: "6px", cursor: "pointer", border: activeImage === imgObj.image ? "2px solid #6fa6ec" : "1px solid #333" }}
                        />
                      ))}
                  </div>
                </div>

                <div style={{ flex: "1 1 350px", display: "flex", flexDirection: "column" }}>
                  <h2 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{selectedProduct.name}</h2>

                  <div style={{ marginBottom: "1rem", color: "#8cbcff", fontWeight: 500 }}>
                    Seller Phone: {selectedProduct.seller_phone || "Not provided"}
                  </div>

                  <div style={{ color: "#8cbcff", fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1.5rem" }}>
                    ${Number(selectedProduct.price).toFixed(2)}
                  </div>

                  <h4 style={{ color: "#ccc", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0.5rem", marginBottom: "0.5rem" }}>Description</h4>
                  <p style={{ lineHeight: "1.6", color: "#e0e0e0", marginBottom: "1.5rem" }}>
                    {selectedProduct.description || "No detailed description available."}
                  </p>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "2rem", background: "rgba(255,255,255,0.05)", padding: "1rem", borderRadius: "8px" }}>
                    {selectedProduct.weight && (
                      <div>
                        <span style={{ color: "#888", fontSize: "0.9rem" }}>Weight:</span>
                        <div style={{ fontWeight: "bold" }}>{selectedProduct.weight} kg</div>
                      </div>
                    )}
                    {selectedProduct.dimensions && (
                       <div>
                        <span style={{ color: "#888", fontSize: "0.9rem" }}>Dimensions:</span>
                        <div style={{ fontWeight: "bold" }}>{selectedProduct.dimensions}</div>
                      </div>
                    )}
                    {selectedProduct.size && (
                       <div>
                        <span style={{ color: "#888", fontSize: "0.9rem" }}>Size:</span>
                        <div style={{ fontWeight: "bold" }}>{selectedProduct.size}</div>
                      </div>
                    )}
                    <div>
                      <span style={{ color: "#888", fontSize: "0.9rem" }}>Category:</span>
                      <div style={{ fontWeight: "bold" }}>{selectedProduct.category?.name}</div>
                    </div>
                  </div>

                  <button
                    className="neon-btn"
                    onClick={() => { handleAddToCart(selectedProduct); closeModal(); }}
                    style={{ marginTop: "auto", width: "100%" }}
                  >
                    Add to Cart
                  </button>
                </div>

              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}