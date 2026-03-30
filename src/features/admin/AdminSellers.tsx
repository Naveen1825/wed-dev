import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearchData } from '@/hooks/useSearchData';
import { Loading } from '@/components/common/Loading';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { FiCheckCircle, FiTrendingUp } from 'react-icons/fi';
import type { Seller } from '@/types';

/**
 * Merchant Store Management Hub.
 * Regulates seller onboarding, credential verification, and revenue performance tracking.
 */
const AdminSellers: React.FC = () => {
  const navigate = useNavigate();
  const { sellers, loading } = useSearchData();
  const [filter, setFilter] = useState<'all' | 'verified' | 'pending'>('all');

  if (loading) return <Loading fullScreen={false} />;

  // Filter based on populated store credentials and status
  const filteredSellers = sellers.filter(seller => {
    if (filter === 'all') return true;
    const isVerified = seller.status === 'verified';
    return filter === 'verified' ? isVerified : !isVerified;
  });

  const sellerColumns = [
    { 
      header: 'Store Entity', 
      key: 'shopName',
      render: (s: Seller) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
           <img 
             src={'https://www.w3schools.com/howto/img_avatar.png'} 
             alt="" 
             style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }}
           />
           <div>
              <div style={{ fontWeight: 700, color: '#1e293b' }}>{s.shopName || 'No Shop Name'}</div>
              <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>{s.sellerLocation || 'Global'}</div>
           </div>
        </div>
      )
    },
    { 
      header: 'Store Status', 
      key: 'status', 
      render: (s: Seller) => {
        const isVerified = s.status === 'verified';
        const isPending = !s.status || s.status === 'pending';
        return <Badge label={isVerified ? 'Verified Active' : isPending ? 'Pending KYC' : 'Rejected'} variant={isVerified ? 'success' : isPending ? 'warning' : 'error'} />;
      }
    },
    { 
      header: 'Sales Velocity', 
      key: 'sales', 
      render: (s: Seller) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#0f172a' }}>
           <FiTrendingUp color="#10b981" />
           {s.analytics?.totalSales || 0} Units
        </div>
      )
    },
    { 
      header: 'Gross Revenue', 
      key: 'revenue', 
      render: (s: Seller) => (
        <span style={{ fontWeight: 700, color: '#2563eb' }}>₹{(s.analytics?.revenue || 0).toLocaleString()}</span>
      )
    },
    { 
      header: 'Compliance Actions', 
      key: 'actions',
      render: (s: Seller) => (
        <div style={{ display: 'flex', gap: '8px' }}>
           <button 
             onClick={() => navigate(`/admin/users/${s.sellerId}`)}
             className="button-base"
             style={{ padding: '6px 12px', background: '#f8fafc', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
           >
             <FiCheckCircle />
             Review KYC Details
           </button>
        </div>
      )
    }
  ];

  return (
    <div className="admin-dashboard-content">
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
           <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Seller Directory</h1>
           <p style={{ color: '#64748b', fontSize: '15px' }}>Verify compliance, track store performance, and manage merchant payouts.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
           <select 
             value={filter} 
             onChange={(e) => setFilter(e.target.value as any)}
             style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: 600 }}
           >
             <option value="all">Every Storefront</option>
             <option value="verified">Verified Hubs Only</option>
             <option value="pending">Pending KYC Review</option>
           </select>
        </div>
      </header>

      <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <Table data={filteredSellers} columns={sellerColumns} />
      </div>
    </div>
  );
};

export default AdminSellers;
