import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearchData } from '@/hooks/useSearchData';
import { Loading } from '@/components/common/Loading';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { FiUserX, FiEye } from 'react-icons/fi';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import type { User } from '@/types';

/**
 * Platform User Administration Hub.
 * Manages global identity governance, account suspension, and detailed registry view.
 */
const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const { users, loading } = useSearchData();
  const [roleFilter, setRoleFilter] = useState<'all' | 'buyer' | 'seller' | 'admin'>('all');

  if (loading) return <Loading fullScreen={false} />;

  const filteredUsers = users.filter(user => 
    roleFilter === 'all' || user.role === roleFilter
  );

  const handleStatusChange = async (uid: string, action: 'activate' | 'suspend') => {
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, { status: action === 'suspend' ? 'suspended' : 'active' });
    } catch (error) {
      console.error(`Error updating user status to ${action}:`, error);
      alert(`Failed to ${action} user. Check database permissions.`);
    }
  };

  const userColumns = [
    { 
      header: 'Identity / Contact', 
      key: 'displayName',
      render: (u: User) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
           <img 
             src={u.photoURL || 'https://www.w3schools.com/howto/img_avatar.png'} 
             alt="" 
             style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
           />
           <div>
              <div style={{ fontWeight: 600, color: '#1e293b' }}>{u.displayName || 'Marketplace User'}</div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>{u.email}</div>
           </div>
        </div>
      )
    },
    { 
      header: 'Assigned Role', 
      key: 'role', 
      render: (u: User) => (
        <Badge 
          label={u.role === 'admin' ? 'Administrator' : u.role === 'seller' ? 'Verified Merchant' : 'Customer'} 
          variant={u.role === 'admin' ? 'primary' : u.role === 'seller' ? 'success' : 'neutral'} 
        />
      )
    },
    { 
      header: 'Joined Date', 
      key: 'joinDate', 
      render: (u: User) => (
        <span style={{ color: '#64748b' }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'N/A'}</span>
      )
    },
    { 
      header: 'Governance', 
      key: 'actions',
      render: (u: User) => (
        <div style={{ display: 'flex', gap: '8px' }}>
           <button 
             onClick={() => navigate(`/admin/users/${u.uid}`)}
             className="button-base"
             style={{ padding: '6px 12px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}
           >
             <FiEye style={{ marginRight: '4px' }} />
             Details
           </button>
           <button 
             onClick={() => handleStatusChange(u.uid, 'suspend')}
             className="button-base"
             style={{ padding: '6px 12px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}
           >
             <FiUserX style={{ marginRight: '4px' }} />
             Suspend
           </button>
        </div>
      )
    }
  ];

  return (
    <div className="admin-dashboard-content">
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
           <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Identity Control</h1>
           <p style={{ color: '#64748b', fontSize: '15px' }}>Govern user roles, track platform adoption, and manage ecosystem suspensions.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
           <select 
             value={roleFilter} 
             onChange={(e) => setRoleFilter(e.target.value as any)}
             style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: 600 }}
           >
             <option value="all">Every Identity</option>
             <option value="buyer">Customers Only</option>
             <option value="seller">Merchants Only</option>
             <option value="admin">Administrators Only</option>
           </select>
        </div>
      </header>

      <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <Table data={filteredUsers} columns={userColumns} />
      </div>
    </div>
  );
};

export default AdminUsers;
