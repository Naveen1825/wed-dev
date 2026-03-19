import React from 'react';
import { MdVerified } from 'react-icons/md';
import { FaStar } from 'react-icons/fa';
import type { Seller } from '../../hooks/useSearchData';

interface SellerGridProps {
  sellers: Seller[];
}

const SellerGrid: React.FC<SellerGridProps> = ({ sellers }) => {
  return (
    <section className="sellers-section">
      <div className="sellers-header">
        <span className="badge">OUR COMMUNITY</span>
        <h2>Trusted Sellers</h2>
        <p>All sellers are verified and authorized to list on Anisell.</p>
      </div>

      <div className="sellers-grid-minimal">
        {sellers.map((seller) => (
          <div key={seller.sellerId} className="seller-card-minimal">
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
                <FaStar /> {seller.rating || '4.8'}
              </span>
              <span className="dot">•</span>
              <span className="seller-pets-minimal">{seller.pets || '0'} Pets</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SellerGrid;
