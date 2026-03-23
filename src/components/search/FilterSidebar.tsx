import React from 'react';
import { FiX } from 'react-icons/fi';

interface FilterSidebarProps {
  resultsCount: number;
  isOpen: boolean;
  onClose: () => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ resultsCount, isOpen, onClose }) => {
  return (
    <>
      <div 
        className={`filter-sidebar-overlay ${isOpen ? 'active' : ''}`} 
        onClick={onClose}
      />
      <aside className={`filter-sidebar ${isOpen ? 'open' : ''}`}>
        <header className="sidebar-header">
          <div className="sidebar-title-row">
            <span>Filters</span>
            <button className="sidebar-close-btn" onClick={onClose}>
              <FiX />
            </button>
            <span className="sidebar-results-count">{resultsCount} Listings</span>
          </div>
        </header>
      
      {/* Moved Sort here */}
      <div className="filter-group">
        <h3>Sort By</h3>
        <div className="filter-options">
          <select className="sidebar-sort-select" defaultValue="new">
            <option value="new">New Listings</option>
            <option value="low-high">Price: Low to High</option>
            <option value="high-low">Price: High to Low</option>
            <option value="popularity">Popularity</option>
          </select>
        </div>
      </div>

      <div className="filter-group">
        <h3>Category</h3>
        <div className="filter-options">
          <label className="filter-option">
            <input type="radio" name="category" defaultChecked />
            <span className="radio-custom"></span>
            <span>All</span>
          </label>
          <label className="filter-option">
            <input type="radio" name="category" />
            <span className="radio-custom"></span>
            <span>Pets</span>
          </label>
          <label className="filter-option">
            <input type="radio" name="category" />
            <span className="radio-custom"></span>
            <span>Toys & Accessories</span>
          </label>
        </div>
      </div>

      <div className="filter-group">
        <h3>Pet Type</h3>
        <div className="filter-options">
          {['Dogs', 'Cats', 'Birds', 'Fish', 'Small Pets'].map(type => (
            <label key={type} className="filter-option">
              <input type="checkbox" />
              <span className="checkbox-custom"></span>
              <span>{type}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <h3>Price Range</h3>
        <div className="price-inputs">
          <div className="price-input-wrapper">
             <span>₹</span>
             <input type="number" placeholder="Min" className="price-input" />
          </div>
          <div className="price-input-wrapper">
             <span>₹</span>
             <input type="number" placeholder="Max" className="price-input" />
          </div>
        </div>
      </div>

      <div className="filter-group">
        <h3>Location</h3>
        <div className="filter-options">
          {['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune'].map(city => (
            <label key={city} className="filter-option">
              <input type="checkbox" />
              <span className="checkbox-custom"></span>
              <span>{city}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <h3>Vaccination</h3>
        <div className="filter-options">
          <label className="filter-option">
            <input type="checkbox" />
            <span className="checkbox-custom"></span>
            <span>Vaccinated Only</span>
          </label>
        </div>
      </div>
      </aside>
    </>
  );
};

export default FilterSidebar;
