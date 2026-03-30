import React, { useMemo } from 'react';
import { useSearchData } from '@/hooks/useSearchData';
import { Loading } from '@/components/common/Loading';
import { Table } from '@/components/ui/Table';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { FiDollarSign, FiPercent, FiTrendingUp } from 'react-icons/fi';

/**
 * Platform Revenue and Merchant Payment Operations.
 * Isolates analytics into actionable payout routing and global financial tracing.
 */
const AdminPayments: React.FC = () => {
  const { sellers, loading } = useSearchData();

  const financialCore = useMemo(() => {
    let globalRevenue = 0;
    let globalCommission = 0;

    const payouts = sellers.map(s => {
      const gmv = s.analytics?.revenue || 0;
      globalRevenue += gmv;
      const commission = gmv * 0.15; // 15% platform cut architecture
      globalCommission += commission;

      return {
         ...s,
         gmv,
         commission,
         payout: gmv - commission,
         status: gmv > 0 ? 'Pending Transfer' : 'Settled'
      };
    }).sort((a, b) => b.gmv - a.gmv); // Top earners first for urgency

    return { globalRevenue, globalCommission, payouts };
  }, [sellers]);

  if (loading) return <Loading fullScreen={false} />;

  const payoutColumns = [
    { 
      header: 'Economic Entity (Store)', 
      key: 'sellerName',
      render: (s: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
           <img src={'https://www.w3schools.com/howto/img_avatar.png'} alt="" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
           <div style={{ fontWeight: 600, color: '#1e293b' }}>{s.shopName || 'Store'}</div>
        </div>
      )
    },
    { 
      header: 'Gross Merchandise Volume (GMV)', 
      key: 'gmv', 
      render: (s: any) => <span style={{ color: '#64748b' }}>₹{s.gmv.toLocaleString()}</span>
    },
    { 
      header: 'Fee Sync (-15%)', 
      key: 'commission', 
      render: (s: any) => <span style={{ color: '#ef4444' }}>-₹{s.commission.toLocaleString()}</span>
    },
    { 
      header: 'Scheduled Payout', 
      key: 'payout', 
      render: (s: any) => <strong style={{ color: '#2563eb' }}>₹{s.payout.toLocaleString()}</strong>
    },
    { 
      header: 'Routing State', 
      key: 'status', 
      render: (s: any) => <Badge label={s.status} variant={s.status === 'Pending Transfer' ? 'warning' : 'neutral'} />
    },
    { 
      header: 'Treasury Action', 
      key: 'actions',
      render: (s: any) => (
        <button 
           onClick={() => alert(`Treasury Control: Attempting to release ₹${s.payout} to ${s.shopName || 'Store'} (Demo)`)}
           disabled={s.status === 'Settled'}
           className="button-base"
           style={{ padding: '6px 16px', background: s.status === 'Settled' ? '#f1f5f9' : '#10b981', color: s.status === 'Settled' ? '#94a3b8' : '#fff', borderRadius: '6px', border: 'none', fontWeight: 600, fontSize: '13px' }}
        >
           Initiate Wire
        </button>
      )
    }
  ];

  return (
    <div className="admin-dashboard-content">
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Payments & Revenue Hub</h1>
        <p style={{ color: '#64748b', fontSize: '15px' }}>Treasury oversight for global platform commissions and merchant payout settlements.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
         <StatCard label="Platform GMV" value={`₹${financialCore.globalRevenue.toLocaleString()}`} icon={<FiTrendingUp />} color="#3b82f6" variant="primary" />
         <StatCard label="Accrued Commissions" value={`₹${financialCore.globalCommission.toLocaleString()}`} icon={<FiPercent />} color="#8b5cf6" variant="neutral" />
         <StatCard label="Pending Store Wires" value={`₹${(financialCore.globalRevenue - financialCore.globalCommission).toLocaleString()}`} icon={<FiDollarSign />} color="#10b981" variant="success" />
      </div>

      <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>Active Settlement Book</h3>
        <Table data={financialCore.payouts} columns={payoutColumns} />
      </div>
    </div>
  );
};

export default AdminPayments;
