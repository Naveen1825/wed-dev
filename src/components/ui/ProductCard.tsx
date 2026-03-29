import React from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiStar, FiMapPin } from 'react-icons/fi';
import type { Product } from '@/types';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: Product;
  variant?: 'compact' | 'standard' | 'detailed';
  onAction?: (id: string) => void;
}

/**
 * Shared ProductCard UI Component.
 * Standardized presentation for pet listings across Home, Search, and Dashboards.
 * Eliminated structural and styling duplication formerly found in Marketplace, SearchResults, and Seller sections.
 */
export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  variant = 'standard',
  onAction 
}) => {
  const isCompact = variant === 'compact';

  return (
    <Link 
      to={`/product/${product.productId}`} 
      className={`${styles.card} ${isCompact ? styles.compact : ''}`}
    >
      {/* 1. Media Layer */}
      <div className={styles.mediaWrapper}>
        <img 
          src={product.productMedia[0] || 'https://via.placeholder.com/300x300?text=AniSell'} 
          alt={product.productSubCategory} 
          className={styles.image}
          loading="lazy"
        />
        {!isCompact && (
          <button 
            className={styles.wishlistBtn} 
            onClick={(e) => { e.preventDefault(); onAction?.(product.productId); }}
          >
            <FiHeart />
          </button>
        )}
      </div>

      {/* 2. Primary Information Core */}
      <div className={styles.content}>
        <div className={styles.header}>
          <h4 className={styles.title}>{product.productSubCategory}</h4>
          <span className={styles.price}>₹{product.productPrice.toLocaleString()}</span>
        </div>

        <div className={styles.meta}>
          <span className={styles.type}>{product.productType}</span>
          <span className={styles.age}>• {product.productAge}</span>
        </div>

        {!isCompact && (
          <div className={styles.footer}>
             <div className={styles.location}>
               <FiMapPin size={12} /> Mumbai
             </div>
             <div className={styles.rating}>
               <FiStar size={12} fill="#ffc107" color="#ffc107" />
               <span>4.5</span>
             </div>
          </div>
        )}
      </div>
    </Link>
  );
};
