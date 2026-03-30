import React, { useMemo } from 'react';
import { useSearchData } from '@/hooks/useSearchData';
import { Loading } from '@/components/common/Loading';
import { FiTrendingUp, FiPieChart, FiBarChart2, FiShoppingCart } from 'react-icons/fi';
import { StatCard } from '@/components/ui/StatCard';

/**
 * Platform Analytics Dashboard.
 * All data is derived from real Firestore collections — no hardcoded values.
 */
const AdminAnalytics: React.FC = () => {
  const { products, sellers, users, buyers, loading } = useSearchData();

  const metrics = useMemo(() => {
    // Derive all orders from buyers
    const allOrders = buyers.flatMap(b => b.orders || []);
    const totalRevenue = allOrders.filter(o => o.status !== 'CANCELLED').reduce((acc, o) => acc + o.amount, 0);
    const totalOrders = allOrders.length;
    const deliveredOrders = allOrders.filter(o => o.status === 'DELIVERED').length;
    const cancelledOrders = allOrders.filter(o => o.status === 'CANCELLED').length;
    const pendingOrders = allOrders.filter(o => o.status === 'PENDING' || o.status === 'PROCESSING').length;

    // Product stats
    const approvedProducts = products.filter(p => p.status === 'APPROVED').length;
    const pendingProducts = products.filter(p => p.status === 'PENDING').length;
    const rejectedProducts = products.filter(p => p.status === 'REJECTED').length;

    // Category distribution
    const categoryMap: Record<string, number> = {};
    products.forEach(p => {
      categoryMap[p.productCategory] = (categoryMap[p.productCategory] || 0) + 1;
    });
    const categories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);

    // 7-day order trend
    const dailyOrders = Array(7).fill(0);
    const now = new Date();
    allOrders.forEach(o => {
      const daysAgo = Math.floor((now.getTime() - new Date(o.orderDate).getTime()) / (1000 * 60 * 60 * 24));
      if (daysAgo >= 0 && daysAgo < 7) {
        dailyOrders[6 - daysAgo]++;
      }
    });

    // Conversion rate (orders / users)
    const conversionRate = users.length > 0 ? Math.round((totalOrders / users.length) * 100) : 0;

    return {
      totalRevenue, totalOrders, deliveredOrders, cancelledOrders, pendingOrders,
      approvedProducts, pendingProducts, rejectedProducts,
      categories, dailyOrders, conversionRate
    };
  }, [products, sellers, users, buyers]);

  if (loading) return <Loading fullScreen={false} />;

  const maxDailyOrder = Math.max(...metrics.dailyOrders, 1);

  return (
    <div className="admin-dashboard-content">
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
           <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Platform Analytics</h1>
           <p style={{ color: '#64748b', fontSize: '15px' }}>Real-time metrics derived from Firestore data.</p>
        </div>
      </header>

      {/* Top-level KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <StatCard label="Total Revenue" value={`₹${metrics.totalRevenue.toLocaleString()}`} icon={<FiTrendingUp />} color="#2563eb" variant="primary" />
        <StatCard label="Total Orders" value={metrics.totalOrders} icon={<FiShoppingCart />} color="#7c3aed" variant="neutral" />
        <StatCard label="Total Users" value={users.length} icon={<FiBarChart2 />} color="#10b981" variant="success" />
        <StatCard label="Conversion" value={`${metrics.conversionRate}%`} icon={<FiPieChart />} color="#ea580c" variant="warning" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: '24px' }}>
        
         {/* 7-Day Order Trend - Real Data */}
         <div style={{ background: '#fff', padding: '32px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}><FiTrendingUp color="#3b82f6"/> 7-Day Order Activity</h3>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '32px' }}>Orders placed in the last 7 days.</p>
            <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', gap: '12px', paddingBottom: '20px', borderBottom: '1px solid #e2e8f0' }}>
               {metrics.dailyOrders.map((v, i) => {
                 const dayLabel = new Date(Date.now() - (6 - i) * 86400000).toLocaleDateString('en', { weekday: 'short' });
                 const height = maxDailyOrder > 0 ? (v / maxDailyOrder) * 100 : 0;
                 return (
                   <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                     <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>{v}</div>
                     <div style={{ width: '100%', background: '#3b82f6', height: `${Math.max(height, 2)}%`, borderRadius: '4px 4px 0 0', opacity: i === 6 ? 1 : 0.6, transition: 'height 0.3s ease' }} />
                     <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>{dayLabel}</div>
                   </div>
                 );
               })}
            </div>
         </div>

         <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Order Status Breakdown */}
            <div style={{ background: '#fff', padding: '32px', borderRadius: '16px', border: '1px solid #e2e8f0', flex: 1 }}>
               <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 24px 0', color: '#1e293b' }}>Order Status Breakdown</h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                 {[
                   { label: 'Delivered', value: metrics.deliveredOrders, color: '#10b981' },
                   { label: 'Pending', value: metrics.pendingOrders, color: '#f59e0b' },
                   { label: 'Cancelled', value: metrics.cancelledOrders, color: '#ef4444' },
                 ].map(row => (
                   <div key={row.label}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                       <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>{row.label}</span>
                       <span style={{ fontSize: '13px', fontWeight: 700, color: row.color }}>{row.value}</span>
                     </div>
                     <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                       <div style={{ width: `${metrics.totalOrders > 0 ? (row.value / metrics.totalOrders) * 100 : 0}%`, height: '100%', background: row.color, transition: 'width 0.3s ease' }} />
                     </div>
                   </div>
                 ))}
               </div>
            </div>
            
            {/* Product Category Distribution */}
            <div style={{ background: '#fff', padding: '32px', borderRadius: '16px', border: '1px solid #e2e8f0', flex: 1 }}>
               <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 16px 0', color: '#1e293b' }}>Product Categories</h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                 {metrics.categories.length > 0 ? metrics.categories.slice(0, 5).map(([cat, count]) => (
                   <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <span style={{ fontWeight: 600, color: '#475569', fontSize: '14px' }}>{cat}</span>
                     <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '14px' }}>{count} listings</span>
                   </div>
                 )) : (
                   <div style={{ textAlign: 'center', color: '#94a3b8', padding: '16px' }}>No products yet</div>
                 )}
               </div>
            </div>
         </div>
      </div>

      {/* Product Status Overview */}
      <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <div style={{ padding: '20px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#10b981' }}>{metrics.approvedProducts}</div>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginTop: '4px' }}>Approved Listings</div>
        </div>
        <div style={{ padding: '20px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#f59e0b' }}>{metrics.pendingProducts}</div>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginTop: '4px' }}>Pending Review</div>
        </div>
        <div style={{ padding: '20px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#ef4444' }}>{metrics.rejectedProducts}</div>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginTop: '4px' }}>Rejected</div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
