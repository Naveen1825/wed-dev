import React from 'react';
import './SearchResults.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FilterSidebar from './components/search/FilterSidebar';
import ProductCard from './components/common/ProductCard';
import { useSearchData } from './hooks/useSearchData';

/**
 * SearchResults Component
 * 
 * Main page for displaying pet listing search results.
 * Manages fetching data via useSearchData hook and assembling the layout.
 */
const SearchResults: React.FC = () => {
  const { products, loading } = useSearchData();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Fetching best deals for you...</p>
      </div>
    );
  }

  return (
    <div className="search-page-wrapper">
      <Navbar />
      
      <div className="search-page-container">
        {/* Results count is now handled inside FilterSidebar */}
        <FilterSidebar resultsCount={products.length} />

        <main className="search-results-main">
          {/* Listing Grid */}
          <div className="listing-grid">
            {products.map((product) => (
              <ProductCard key={product.productId} product={product} />
            ))}
          </div>

          {/* Empty State */}
          {products.length === 0 && (
            <div className="empty-results">
              <p>No listings found matching your criteria.</p>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default SearchResults;
