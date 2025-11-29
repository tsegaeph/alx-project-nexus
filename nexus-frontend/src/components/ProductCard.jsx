import React from 'react';

export default function ProductCard({ product, onAddToCart }) {

  if (!product) return null;

  const image = product.main_image || "https://via.placeholder.com/150";
  const name = product.name || "Unnamed Product";
  const desc = product.short_description || product.description || "No description available";

  let price = "0.00";
  if (product.price) {
    price = Number(product.price).toFixed(2);
  }

  return (
    <div className="product-card glass">
      <img 
        src={image} 
        alt={name}
        className="product-img" 
      />

      <div className="product-info">
        <h3>{name}</h3>
        <p className="product-desc">{desc}</p>

        <div className="product-bottom">
          <span className="product-price">${price}</span>

          <button 
            className="neon-btn"
            onClick={() => onAddToCart(product)}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
