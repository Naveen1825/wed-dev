import React, { useMemo } from 'react';
import { MdVerified } from 'react-icons/md';
import { FaStar, FaPaw } from 'react-icons/fa';
import type { Seller } from '../../hooks/useSearchData';

// --- Interface ---
interface SellerGridProps {
  sellers: Seller[];
}

const SellerGrid: React.FC<SellerGridProps> = ({ sellers }) => {
  // Optimization: Filter out sellers with no products and sort by totalSales or rating
  // The user wants to KEEP sorting by number of sales but display number of pets
  const topSellers = useMemo(() => {
    return sellers
      .filter((s) => s.productIds?.length > 0)
      .sort((a, b) => {
        const salesA = a.analytics?.totalSales || 0;
        const salesB = b.analytics?.totalSales || 0;
        if (salesA !== salesB) return salesB - salesA;
        return (b.rating || 0) - (a.rating || 0);
      })
      .slice(0, 4); 
  }, [sellers]);

  if (topSellers.length === 0) return null;

  return (
    <section className="sellers-section">
      <div className="sellers-header">
        <span className="badge">CERTIFIED SELLERS</span>
        <h2>Top Store Community</h2>
        <p>Verified sellers with the highest performance and customer satisfaction.</p>
      </div>

      <div className="sellers-grid-minimal">
        {topSellers.map((seller) => (
          <div key={seller.sellerId} className="seller-card-minimal">
            {/* "TOP SELLER" badge removed as per request */}
            
            <div className="seller-avatar-minimal">
              <img 
                src={seller.sellerProfile} 
                alt={seller.sellerName} 
                className="avatar-img"
              />
            </div>
            
            <h3 className="seller-name-minimal">
              <MdVerified className="verified-icon-minimal" /> {seller.sellerName}
            </h3>
            
            <p className="seller-location-minimal">{seller.sellerLocation}</p>
            
            <div className="seller-meta-minimal">
              <span className="seller-ratio-minimal">
                <FaStar /> {seller.rating?.toFixed(1) || '4.8'}
              </span>
              <span className="dot">•</span>
              <span className="seller-sales-minimal" style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FaPaw style={{ opacity: 0.6 }} /> {seller.pets || '0'} Pets
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SellerGrid;
