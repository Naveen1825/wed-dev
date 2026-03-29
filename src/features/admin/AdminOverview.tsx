import React from 'react';
import { 
  FiUsers, FiPackage, FiActivity 
} from 'react-icons/fi';
import { MdStorefront } from 'react-icons/md';
import type { Product, Seller, User } from '@/types';
import { StatCard } from '@/components/ui/StatCard';
import styles from './AdminOverview.module.css';

interface OverviewProps {
  products: Product[];
  sellers: Seller[];
  users: User[];
  analytics: {
    totalRevenue: number;
    totalSales: number;
    totalViews: number;
    totalReviews: number;
    topProducts: Product[];
    pendingInquiries: number;
  };
}

/**
 * Admin Overview Feature.
 * Orchestrates a high-fidelity dashboard display featuring platform-wide KPIs, 
 * user growth tracking, and top-performing pet listings for administrators.
 * Refactored to eliminate duplicate metric logic by leveraging the shared StatCard UI component.
 */
export const AdminOverview: React.FC<OverviewProps> = ({ products, sellers, users, analytics }) => {
  return (
    <div className={styles.overview}>
      {/* 1. Global Platform KPI Grid - Unified UI */}
      <div className={styles.metricsGrid}>
        <StatCard 
          label="Gross Revenue" 
          value={`₹${analytics.totalRevenue.toLocaleString()}`} 
          icon={<FiActivity />} 
          color="#2563eb"
          variant="primary"
        />
        <StatCard 
          label="Verified Sellers" 
          value={sellers.length} 
          icon={<MdStorefront />} 
          color="#7c3aed"
          variant="neutral"
        />
        <StatCard 
          label="Active Users" 
          value={users.length} 
          icon={<FiUsers />} 
          color="#10b981"
          variant="success"
        />
        <StatCard 
          label="Live Listings" 
          value={products.length} 
          icon={<FiPackage />} 
          color="#ea580c"
          variant="warning"
        />
      </div>

      {/* 2. Platform Discovery - Top Listings Table */}
      <div className={styles.tableSection}>
        <div className={styles.tableHeader}>
           <h3 className={styles.tableTitle}>Top Performing Listings</h3>
           <span className={styles.statusPending}>Live Performance</span>
        </div>
        
        <table className={styles.adminTable}>
          <thead>
            <tr>
              <th>Listing Category</th>
              <th>Seller Account</th>
              <th>Current Stock</th>
              <th>Performance</th>
            </tr>
          </thead>
          <tbody>
            {analytics.topProducts.slice(0, 5).map(p => (
              <tr key={p.productId}>
                <td>
                  <div className={styles.userCell}>
                    <img src={p.productMedia[0]} alt="" className={styles.avatar} />
                    <strong>{p.productSubCategory}</strong>
                  </div>
                </td>
                <td>{sellers.find(s => s.sellerId === p.sellerId)?.sellerName || 'Verified Merchant'}</td>
                <td>Available</td>
                <td>
                  <span className={styles.statusVerified}>High Sales</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 3. Recent Platform Registrations */}
      <div className={styles.tableSection}>
        <h3 className={styles.tableTitle} style={{ marginBottom: '24px' }}>New User Onboarding</h3>
        <table className={styles.adminTable}>
          <thead>
            <tr>
              <th>User Details</th>
              <th>Channel</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.slice(0, 3).map(u => (
              <tr key={u.uid}>
                <td>
                  <div className={styles.userCell}>
                    <img src={u.photoURL || 'https://www.w3schools.com/howto/img_avatar.png'} alt="" className={styles.avatar} />
                    <div>
                       <div style={{ fontWeight: 600 }}>{u.displayName}</div>
                       <div style={{ fontSize: '12px', color: '#64748b' }}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td>Platform Direct</td>
                <td><span className={styles.statusVerified}>Active</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
