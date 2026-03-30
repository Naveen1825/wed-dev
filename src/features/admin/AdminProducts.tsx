import React, { useState } from 'react';
import { useSearchData } from '@/hooks/useSearchData';
import { Loading } from '@/components/common/Loading';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { FiTrash2, FiEdit2, FiEye } from 'react-icons/fi';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import type { Product } from '@/types';

/**
 * Platform Supply Oversight.
 * Governs the marketplace catalog, category architecture, and stock policies.
 */
const AdminProducts: React.FC = () => {
  const { products, loading } = useSearchData();
  const [filterType, setFilterType] = useState('All');

  if (loading) return <Loading fullScreen={false} />;

  const uniqueTypes = ['All', ...Array.from(new Set(products.map(p => p.productType)))];
  const filteredProducts = products.filter(p => filterType === 'All' || p.productType === filterType);

  const handleAction = async (id: string, action: string) => {
    const confirmationText = action === 'Delete' ? 'purge' : action === 'Approve' ? 'verify and set live' : 'reject';
    if (!window.confirm(`Are you certain you want to ${confirmationText} this listing?`)) return;

    try {
      const productRef = doc(db, 'products', id);
      if (action === 'Delete') {
         await deleteDoc(productRef);
      } else if (action === 'Approve') {
         await updateDoc(productRef, { status: 'APPROVED' });
      } else if (action === 'Reject') {
         await updateDoc(productRef, { status: 'REJECTED' });
      } else if (action === 'Moderate') {
         alert('Moderate routing hook enabled. Redirect pending.');
      }
    } catch (error) {
       console.error(`Failed to execute ${action} on product ${id}:`, error);
       alert(`Authorization failure: Unable to ${action.toLowerCase()} listing.`);
    }
  };

  const productColumns = [
    { 
      header: 'Listing Entity', 
      key: 'productSubCategory',
      render: (p: Product) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
           <img 
             src={p.productMedia[0]} 
             alt="" 
             style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
           />
           <div>
              <div style={{ fontWeight: 700, color: '#1e293b' }}>{p.productSubCategory}</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>{p.productType} • {p.productAge}</div>
           </div>
        </div>
      )
    },
    { 
      header: 'Supply Status', 
      key: 'status', 
      render: (p: Product) => {
        const variants: Record<string, any> = {
          'APPROVED': 'success',
          'PENDING': 'warning',
          'REJECTED': 'error',
          'SOLD': 'neutral'
        };
        const labels: Record<string, string> = {
          'APPROVED': 'Live Catalog',
          'PENDING': 'Verification Req.',
          'REJECTED': 'Rejected Listing',
          'SOLD': 'Fulfillment Closed'
        };
        return <Badge label={labels[p.status] || p.status} variant={variants[p.status] || 'neutral'} />;
      }
    },
    { 
      header: 'Market Value', 
      key: 'productPrice', 
      render: (p: Product) => (
        <span style={{ fontWeight: 700, color: '#2563eb' }}>₹{p.productPrice.toLocaleString()}</span>
      )
    },
    { 
      header: 'Registry Control', 
      key: 'actions',
      render: (p: Product) => (
        <div style={{ display: 'flex', gap: '8px' }}>
           {p.status === 'PENDING' && (
             <>
               <button onClick={() => handleAction(p.productId, 'Approve')} className="button-base" style={{ padding: '8px', background: '#d1fae5', color: '#059669', borderRadius: '6px' }} title="Approve Listing"><FiEye /></button>
               <button onClick={() => handleAction(p.productId, 'Reject')} className="button-base" style={{ padding: '8px', background: '#fee2e2', color: '#dc2626', borderRadius: '6px' }} title="Reject Listing"><FiTrash2 /></button>
             </>
           )}
           <button onClick={() => handleAction(p.productId, 'Moderate')} className="button-base" style={{ padding: '8px', background: '#f1f5f9', color: '#475569', borderRadius: '6px' }} title="Edit Registry"><FiEdit2 /></button>
           <button onClick={() => handleAction(p.productId, 'Delete')} className="button-base" style={{ padding: '8px', background: '#f1f5f9', color: '#64748b', borderRadius: '6px' }} title="Purge Record"><FiTrash2 /></button>
        </div>
      )
    }
  ];

  return (
    <div className="admin-dashboard-content">
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
           <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Product Control</h1>
           <p style={{ color: '#64748b', fontSize: '15px' }}>Govern marketplace inventory, curate catalogs, and enforce supply quality.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
           <select 
             value={filterType} 
             onChange={(e) => setFilterType(e.target.value)}
             style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: 600 }}
           >
             {uniqueTypes.map(t => <option key={t} value={t}>{t} Category</option>)}
           </select>
        </div>
      </header>

      <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <Table data={filteredProducts} columns={productColumns} />
      </div>
    </div>
  );
};

export default AdminProducts;
