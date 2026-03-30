import React, { useState, useMemo } from 'react';
import { useSearchData } from '@/hooks/useSearchData';
import { Loading } from '@/components/common/Loading';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { FiBox, FiCheck, FiTruck, FiXCircle } from 'react-icons/fi';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/services/firebase/config';

/**
 * Logistics and Order Tracking Hub.
 * Analyzes platform transaction volume and coordinates fulfillment state tracking.
 */
const AdminOrders: React.FC = () => {
  const { users, buyers, loading } = useSearchData();
  const [filter, setFilter] = useState('All');

  // Distill all cross-platform orders from the decentralized buyer profiles
  const allOrders = useMemo(() => {
    return buyers.flatMap(b => {
      const user = users.find(u => u.uid === b.buyerId);
      return (b.orders || []).map((order: any) => ({
        ...order,
        buyerName: user?.displayName || 'Marketplace Member',
        buyerEmail: user?.email || 'N/A',
        buyerId: b.buyerId
      }));
    });
  }, [buyers, users]);

  if (loading) return <Loading fullScreen={false} />;

  const filteredOrders = allOrders.filter(o => filter === 'All' || o.status === filter);

  const handleStatusUpdate = async (id: string, buyerId: string, newStatus: string) => {
    if (!window.confirm(`Advance order ${id} to ${newStatus}?`)) return;
    try {
      const buyerRecord = buyers.find(b => b.buyerId === buyerId);
      if (!buyerRecord) throw new Error('Orphaned Order');
      
      const buyerRef = doc(db, 'buyers', buyerId);
      const updatedOrders = (buyerRecord.orders || []).map((o: any) => 
         o.orderId === id ? { ...o, status: newStatus as any } : o
      );
      
      await updateDoc(buyerRef, { orders: updatedOrders });
    } catch (error) {
      console.error(`Failed to execute logistics update on order ${id}:`, error);
      alert('Network failure: Unable to transition order state.');
    }
  };

  const orderColumns = [
    { 
      header: 'Operation Reference', 
      key: 'orderId',
      render: (o: any) => (
        <div>
           <div style={{ fontWeight: 700, color: '#1e293b' }}>{o.orderId.substring(0, 8)}</div>
           <div style={{ fontSize: '11px', color: '#64748b' }}>Item Registry: {o.productId.substring(0, 6)}</div>
        </div>
      )
    },
    { 
      header: 'Fulfillment Entity', 
      key: 'buyer', 
      render: (o: any) => (
        <div>
           <div style={{ fontWeight: 600, color: '#0f172a' }}>{o.buyerName}</div>
           <div style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>Buyer ID: {o.buyerId.substring(0, 8)}...</div>
        </div>
      )
    },
    { 
      header: 'Gross Flow', 
      key: 'revenue', 
      render: (o: any) => (
        <span style={{ fontWeight: 700, color: '#10b981' }}>₹{o.amount.toLocaleString()}</span>
      )
    },
    { 
      header: 'Operational State', 
      key: 'status', 
      render: (o: any) => {
         const variants: any = {
           'DELIVERED': 'success',
           'SHIPPED': 'primary',
           'PROCESSING': 'warning',
           'CANCELLED': 'error',
           'PENDING': 'neutral'
         };
         return <Badge label={o.status || 'PENDING'} variant={variants[o.status] || 'neutral'} />;
      }
    },
    { 
      header: 'Logistics Command', 
      key: 'actions',
      render: (o: any) => (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
           <button onClick={() => handleStatusUpdate(o.orderId, o.buyerId, 'PROCESSING')} className="button-base" style={{ padding: '6px', background: '#fef3c7', color: '#d97706', borderRadius: '6px', border: 'none' }} title="Mark Processing"><FiBox /></button>
           <button onClick={() => handleStatusUpdate(o.orderId, o.buyerId, 'SHIPPED')} className="button-base" style={{ padding: '6px', background: '#e0e7ff', color: '#4f46e5', borderRadius: '6px', border: 'none' }} title="Mark Confirmed Dispatch"><FiTruck /></button>
           <button onClick={() => handleStatusUpdate(o.orderId, o.buyerId, 'DELIVERED')} className="button-base" style={{ padding: '6px', background: '#d1fae5', color: '#059669', borderRadius: '6px', border: 'none' }} title="Fulfillment Check"><FiCheck /></button>
           <button onClick={() => handleStatusUpdate(o.orderId, o.buyerId, 'CANCELLED')} className="button-base" style={{ padding: '6px', background: '#fee2e2', color: '#dc2626', borderRadius: '6px', border: 'none' }} title="Cancel Order"><FiXCircle /></button>
        </div>
      )
    }
  ];

  return (
    <div className="admin-dashboard-content">
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
           <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Order Tracking</h1>
           <p style={{ color: '#64748b', fontSize: '15px' }}>Govern fulfillment pipelines and oversee platform logistics operations.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
           <select 
             value={filter} 
             onChange={(e) => setFilter(e.target.value)}
             style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: 600 }}
           >
             <option value="All">All Operations</option>
             <option value="PENDING">Pending Action</option>
             <option value="PROCESSING">Currently Processing</option>
             <option value="SHIPPED">In Transit Hubs</option>
             <option value="DELIVERED">Fulfillment Closed</option>
             <option value="CANCELLED">Voided Pacts</option>
           </select>
        </div>
      </header>

      <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <Table data={filteredOrders} columns={orderColumns} />
      </div>
    </div>
  );
};

export default AdminOrders;
