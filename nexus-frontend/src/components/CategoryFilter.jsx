import React from 'react';

const categories = ['All', 'Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Books', 'Beauty'];

export default function CategoryFilter({ selected, onSelect }) {
  return (
    <div className="category-filter">
      {categories.map(cat => (
        <button 
          key={cat}
          className={`category-btn glass ${selected === cat ? 'selected' : ''}`}
          onClick={() => onSelect(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}