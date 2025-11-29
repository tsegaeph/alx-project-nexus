import { Link, useLocation, useNavigate } from "react-router-dom";
import "./SellerSidebar.css";

const items = [
  { name: "Dashboard", icon: "🏠", to: "/seller/dashboard" },
  { name: "Categories", icon: "📂", to: "/seller/categories" },
  { name: "Add Product", icon: "➕", to: "/seller/add-product" },
  { name: "My Products", icon: "📦", to: "/seller/products" },
  { name: "Orders", icon: "📋", to: "/seller/orders" },
];

export default function SellerSidebar({ openSellerSettingsModal }) { // <-- receive prop
  const { pathname } = useLocation();
  const navigate = useNavigate();

  function handleLogout(e) {
    e.preventDefault();
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/auth");
  }

  return (
    <nav className="seller-sidebar" style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div className="sidebar-title">Seller Dashboard</div>
      
      <ul style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {items.map(item => (
          <li key={item.name} className={pathname.startsWith(item.to) ? "active" : ""}>
            {item.name === "Settings" ? (
              <button
                onClick={openSellerSettingsModal} // <-- open modal instead of navigate
                className="sidebar-settings-btn"
                style={{
                  width: "100%",
                  textAlign: "left",
                  background: "transparent",
                  border: "none",
                  color: "inherit",
                  font: "inherit",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  padding: "10px 15px"
                }}
              >
                <span className="icon" style={{ marginRight: "10px" }}>{item.icon}</span> {item.name}
              </button>
            ) : (
              <Link to={item.to}>
                <span className="icon">{item.icon}</span> {item.name}
              </Link>
            )}
          </li>
        ))}
        
        <div style={{ flexGrow: 1 }}></div>

        <li>
          <button 
            onClick={handleLogout}
            className="sidebar-logout"
            style={{ 
              width: "80%", 
              textAlign: "center", 
              background: "#5c0f0fff", 
              border: "1px solid red", 
              borderRadius: "1rem",
              color: "#fff", 
              font: "inherit",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              padding: "10px 15px",
              position: "relative",
              bottom:"1.4em"
            }}
          >
            <span className="icon" style={{ marginRight: "10px" }}>🚪</span> Logout
          </button>
        </li>
      </ul>
    </nav>
  );
}
