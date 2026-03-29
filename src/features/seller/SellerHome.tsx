import React from 'react';
import { FiTrendingUp, FiShoppingBag, FiStar, FiBarChart2 } from 'react-icons/fi';
import type { Seller, Product } from '@/types';
import { StatCard } from '@/components/ui/StatCard';
import styles from './SellerHome.module.css';

interface SellerHomeProps {
  seller: Seller;
  products: Product[];
}

/**
 * Seller Dashboard Home Feature.
 * Orchestrates merchant-branded visualizations for store analytics, revenue trends, 
 * and top-performing Listings through a scoped styling architectural layer.
 * Refactored to eliminate duplicate metric logic by leveraging the shared StatCard UI component.
 */
export const SellerHome: React.FC<SellerHomeProps> = ({ seller, products }) => {
  const analytics = seller.analytics || {
    totalSales: 0, revenue: 0, storeViews: 0, conversion: 0, storeRating: 0, salesHistory: [0,0,0,0,0,0,0]
  };

  const topProducts = products
    .filter(p => (p.newSalesCount || 0) > 0)
    .sort((a, b) => (b.newSalesCount || 0) - (a.newSalesCount || 0))
    .slice(0, 3);

  return (
    <div className={styles.container}>
      {/* 1. Merchant KPI Metrics - Core Dashboard Hub */}
      <div className={styles.kpiGrid}>
        <StatCard 
          label="Total Sales" 
          value={analytics.totalSales} 
          icon={<FiShoppingBag />} 
          color="#2563eb"
          variant="primary"
        />
        <StatCard 
          label="Store Views" 
          value={analytics.storeViews.toLocaleString()} 
          icon={<FiBarChart2 />} 
          color="#ea580c"
          variant="warning"
        />
        <StatCard 
          label="Gross Revenue" 
          value={`₹${analytics.revenue.toLocaleString()}`} 
          icon={<FiTrendingUp />} 
          color="#10b981"
          variant="success"
        />
        <StatCard 
          label="Conversion" 
          value={`${analytics.conversion}%`} 
          icon={<FiStar />} 
          color="#7c3aed"
          variant="neutral"
        />
      </div>

      {/* 2. Performance Tracking - 7 Day Trend */}
      <div className={styles.chartCard}>
        <h3 className={styles.chartTitle}>7-Day Sales Performance</h3>
        <div className={styles.chartArea}>
          {analytics.salesHistory.map((val, i) => (
            <div key={i} className={styles.chartBarGroup}>
              <div 
                className={`${styles.chartBar} ${i === 6 ? styles.chartBarActive : ''}`} 
                style={{ height: `${Math.max(val * 12, 4)}px` }} 
              />
              <span className={styles.chartLabel}>D{i+1}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Operational Discovery - Top Listings */}
      <div className={styles.topProductsCard}>
        <h3 className={styles.chartTitle}>Top Performing Listings</h3>
        <div className={styles.productList}>
          {topProducts.length > 0 ? topProducts.map(p => (
            <div key={p.productId} className={styles.productItem}>
              <img src={p.productMedia[0]} alt="" className={styles.productImage} />
              <div className={styles.productInfo}>
                <div className={styles.productName}>{p.productSubCategory}</div>
                <div className={styles.productMeta}>{p.productType} • Last 30 Days</div>
              </div>
              <div className={styles.productStats}>
                 <div className={styles.salesValue}>{p.newSalesCount} Items Sold</div>
              </div>
            </div>
          )) : (
            <p className={styles.productMeta} style={{ textAlign: 'center', padding: '24px' }}>
              No performance data captured for active listings yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
