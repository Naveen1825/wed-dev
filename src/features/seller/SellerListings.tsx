import React from 'react';
import { ProductCard } from '@/components/ui/ProductCard';
import { Badge } from '@/components/ui/Badge';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import type { Product } from '@/types';
import styles from './SellerListings.module.css';

interface SellerListingsProps {
  products: Product[];
  onAdd?: () => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

/**
 * Merchant Listing Management Feature.
 * Orchestrates the seller's active stock, leveraging the shared ProductCard (compact)
 * and Badge UI components to visualize standardized platform statuses.
 * Extracted from SellerProfile.tsx to isolate merchant-specific features.
 */
export const SellerListings: React.FC<SellerListingsProps> = ({ 
  products, 
  onAdd, 
  onEdit, 
  onDelete 
}) => {
  return (
    <div className={styles.container}>
      {/* 1. Portal Meta - Actions & Summary */}
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>Live Inventory</h2>
          <p className={styles.subtitle}>Manage your currently active pet listings and stock levels.</p>
        </div>
        <button className="button-base button-primary" onClick={onAdd}>
          <FiPlus /> Add New Listing
        </button>
      </header>

      {/* 2. Operational Hub - Inventory Visualization */}
      {products.length > 0 ? (
        <div className={styles.grid}>
          {products.map(product => (
            <div key={product.productId} className={styles.productWrapper}>
               <ProductCard product={product as any} variant="compact" />
               <div className={styles.actionsOverlay}>
                  <div className={styles.statusBox}>
                     <Badge label="Active" variant="success" />
                     <span className={styles.stock}>Stock: 1</span>
                  </div>
                  <div className={styles.btnGroup}>
                     <button className={styles.actionBtn} onClick={() => onEdit?.(product.productId)}>
                       <FiEdit2 />
                     </button>
                     <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => onDelete?.(product.productId)}>
                       <FiTrash2 />
                     </button>
                  </div>
               </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
           <p>Your store doesn't have any active pet listings yet.</p>
           <button className="button-base button-outline" onClick={onAdd}>Establish First Listing</button>
        </div>
      )}
    </div>
  );
};
