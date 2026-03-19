import React from 'react';
import ProductCard from '../common/ProductCard';
import type { Product } from '../../hooks/useSearchData';

interface MarketplaceProps {
  products: Product[];
}

const Marketplace: React.FC<MarketplaceProps> = ({ products }) => {
  const displayedPets = products
    .filter((p) => p.productCategory === 'Pets')
    .slice(0, 9); // Specifically 9 for 3x3 grid

  return (
    <section className="marketplace-section">
      <div className="marketplace-header">
        <span className="badge">PET MARKETPLACE</span>
        <h2>Find Your Perfect Companion</h2>
        <p>Browse our curated selection of healthy pets from verified sellers.</p>
      </div>

      <div className="pet-grid">
        {displayedPets.map((pet) => (
          <ProductCard key={pet.productId} product={pet} />
        ))}
      </div>

      <div className="view-all-container">
        <button className="view-all-btn">
          View All Pets <span>→</span>
        </button>
      </div>
    </section>
  );
};

export default Marketplace;
