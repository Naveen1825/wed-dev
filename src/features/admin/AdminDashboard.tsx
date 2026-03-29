import React, { useState, useMemo } from 'react';
import { useSearchData } from '@/hooks/useSearchData';
import { AdminOverview } from '@/features/admin/AdminOverview';
import { UserManagement } from '@/features/admin/UserManagement';
import { Loading } from '@/components/common/Loading';
import type { Product, Seller, User } from '@/types';

/**
 * Admin Dashboard - Platform Governance.
 * Orchestrates platform administration, providing high-fidelity oversight into performance, 
 * identities, and inquiries through modularized role-based features.
 * Refactored to resolve critical type mismatches and architectural duplication.
 */
const Admin: React.FC = () => {
  const { products, sellers, users, loading } = useSearchData();
  const [activeTab, setActiveTab] = useState<'overview' | 'accounts' | 'inquiries'>('overview');

  // Derive specialized analytics core for the overview feature
  const analytics = useMemo(() => {
    const typedSellers = sellers as Seller[];
    const typedProducts = products as Product[];
    
    const totalRevenue = typedSellers.reduce((acc, s) => acc + (s.analytics?.revenue || 0), 0);
    const totalSales = typedSellers.reduce((acc, s) => acc + (s.analytics?.totalSales || 0), 0);
    const totalViews = typedSellers.reduce((acc, s) => acc + (s.analytics?.storeViews || 0), 0);
    const totalReviews = typedProducts.reduce((acc, p) => acc + (p.productReviews?.length || 0), 0);
    
    const topProducts = [...typedProducts]
      .filter(p => (p.newSalesCount || 0) > 0)
      .sort((a, b) => (b.newSalesCount || 0) - (a.newSalesCount || 0));

    return {
      totalRevenue,
      totalSales,
      totalViews,
      totalReviews,
      topProducts,
      pendingInquiries: 0
    };
  }, [products, sellers]);

  if (loading) return <Loading fullScreen={false} />;

  return (
    <div className="admin-dashboard-content">
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
           <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Governance Oversight</h1>
           <p style={{ color: '#64748b', fontSize: '15px' }}>Real-time metrics and administration for the AniSell marketplace.</p>
        </div>
        
        {/* Feature Channel Orchestration */}
        <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
           {[
             { id: 'overview', label: 'Platform Metrics' },
             { id: 'accounts', label: 'Identity Control' },
             { id: 'inquiries', label: 'Inquiry Hub' }
           ].map(tab => (
             <button 
               key={tab.id}
               onClick={() => setActiveTab(tab.id as any)}
               style={{ 
                 padding: '8px 16px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: 600, 
                 background: activeTab === tab.id ? '#fff' : 'transparent', 
                 color: activeTab === tab.id ? '#2563eb' : '#64748b', 
                 cursor: 'pointer', 
                 boxShadow: activeTab === tab.id ? '0 1px 3px rgba(0,0,0,0.05)' : 'none' 
               }}
             >
               {tab.label}
             </button>
           ))}
        </div>
      </header>

      {/* Portal Operational Views - Unified Features */}
      {activeTab === 'overview' && (
        <AdminOverview 
          products={products as Product[]}
          sellers={sellers as Seller[]}
          users={users as User[]}
          analytics={analytics}
        />
      )}

      {activeTab === 'accounts' && (
        <UserManagement 
          users={users as User[]}
          sellers={sellers as Seller[]}
          onVerify={(id) => alert(`Identity system: Verify ${id} (Demo)`)}
        />
      )}

      {activeTab === 'inquiries' && <div>Inquiry Sub-Portal Architecture: Refactor Pending</div>}
    </div>
  );
};

export default Admin;
