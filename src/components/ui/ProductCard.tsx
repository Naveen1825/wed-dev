import React from 'react';
import { Link } from 'react-router-dom';
import { FaMars, FaVenus, FaVenusMars } from 'react-icons/fa';
import { FiCalendar, FiMapPin } from 'react-icons/fi';
import { MdVerified } from 'react-icons/md';
import type { Product } from '@/types';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: Product;
  showStatus?: boolean;
}

/**
 * Shared ProductCard UI Component.
 * Refined per user design specifications with refined hover physics,
 * integrated gender symbology, and localized metadata.
 */
export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  showStatus = false
}) => {
  const isMale = product.productGender?.toLowerCase() === 'male';
  
  // Display only the city and state from the location string (e.g., "Mumbai, MH")
  const formatLocation = (loc?: string) => {
    if (!loc || loc === 'Global Marketplace') return 'Global';
    const parts = loc.split(',').map(p => p.trim()).filter(p => p.length > 0);
    
    // Indian address logic: identifies if the last part is a PIN code (digits)
    const hasDigits = (s: string) => /\d/.test(s);
    let cityIndex = parts.length - 2;
    let stateIndex = parts.length - 1;

    if (parts.length >= 3 && hasDigits(parts[parts.length - 1])) {
      // Last part is likely a PIN code, shift back
      cityIndex = parts.length - 3;
      stateIndex = parts.length - 2;
    }

    if (cityIndex >= 0 && stateIndex >= 0) {
      return `${parts[cityIndex]}, ${parts[stateIndex]}`;
    }
    
    return loc;
  };

  const displayLocation = formatLocation(product.sellerLocation);

  const statusLabels = {
    APPROVED: 'Approved',
    PENDING: 'Pending',
    REJECTED: 'Rejected',
    SOLD: 'Sold'
  };

  return (
    <Link 
      to={showStatus ? '#' : `/product/${product.productId}`} 
      className={styles.card}
      onClick={(e) => showStatus && e.preventDefault()}
    >
      {/* Media Portfolio */}
      <div className={styles.mediaWrapper}>
        <img 
          src={product.productMedia[0] || 'https://via.placeholder.com/300x300?text=AniSell'} 
          alt={product.productSubCategory} 
          className={styles.image}
          loading="lazy"
        />
        
        {showStatus && (
          <div className={`${styles.statusOverlay} ${styles[`status_${product.status}`]}`}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor' }}></div>
            {statusLabels[product.status]}
          </div>
        )}
      </div>

      {/* Information Section */}
      <div className={styles.content}>
        <div className={styles.headerRow}>
          <h2 className={styles.title}>
            {product.productSubCategory}
            
            {/* Badges/Icons Row */}
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginLeft: '8px' }}>
              {product.productVaccinated && (
                <MdVerified className={styles.verifiedIcon} title="Verified / Vaccinated" />
              )}
              {product.productIsPair ? (
                <FaVenusMars className={styles.genderIconPair} title="Bonded Pair" />
              ) : isMale ? (
                <FaMars className={styles.genderIconMale} title="Male" />
              ) : (
                <FaVenus className={styles.genderIconFemale} title="Female" />
              )}
            </div>
          </h2>
        </div>
        
        <p className={styles.description}>{product.productDescription || `A healthy and playful ${product.productSubCategory} pet.`}</p>

        <div className={styles.priceSection}>
          <span className={styles.priceCurrency}>₹</span>
          <span className={styles.priceValue}>{product.productPrice.toLocaleString('en-IN')}</span>
        </div>

        {/* Info Chips Footer */}
        <footer className={styles.footer}>
          <div className={styles.infoChip}>
            <FiMapPin className={styles.chipIcon} />
            <span>{displayLocation}</span>
          </div>
          <div className={styles.infoChip}>
            <FiCalendar className={styles.chipIcon} />
            <span>{product.productAge}</span>
          </div>
        </footer>
      </div>
    </Link>
  );
};
