import React, { useState } from 'react';
import { useSearchData } from '@/hooks/useSearchData';
import { Loading } from '@/components/common/Loading';
import { ListingGrid } from '@/features/public/ListingGrid';
import FilterSidebar from '@/components/search/FilterSidebar';
import { FiFilter } from 'react-icons/fi';
import './SearchResults.css';

/**
 * Search Results Page.
 * Orchestrates the pet marketplace search experience, featuring a responsive 
 * filter sidebar and dynamic product grid synchronized with Firestore.
 * Refactored to eliminate duplicate listing JSX by leveraging the Public ListingGrid feature.
 */
const SearchResults: React.FC = () => {
  const { products, loading } = useSearchData();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (loading) return <Loading fullScreen={true} />;

  return (
    <div className="search-page-container">
      {/* Mobile Filter Control */}
      <div className="mobile-filter-bar" style={{ display: 'none' }}>
        <button className="mobile-filter-btn" onClick={() => setIsSidebarOpen(true)}>
          <FiFilter /> Filters & Sort
        </button>
        <span className="results-count-mobile">{products.length} Listings</span>
      </div>

      {/* Structured Discovery Tools */}
      <FilterSidebar 
        resultsCount={products.length} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Dynamic Results Grid - Unified Grid Feature */}
      <main className="search-results-main">
        <ListingGrid 
          products={products as any} 
          columns={3}
          showEmpty={true}
        />
      </main>
    </div>
  );
};

export default SearchResults;
