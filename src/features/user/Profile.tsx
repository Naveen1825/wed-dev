import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSearchData } from '@/hooks/useSearchData';
import { Loading } from '@/components/common/Loading';
import { UserOrders } from '@/features/user/UserOrders';
import { FiPackage, FiSearch } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

/**
 * User Profile Dashboard Content.
 * Orchestrates the customer-facing history view, leveraging the UserOrders 
 * feature to isolate purchase activity and fulfillment tracking.
 * Fixed to read orders from buyerData (buyers collection) rather than user document.
 */
const Profile: React.FC = () => {
  const { buyerData } = useAuth();
  const { products, loading: dataLoading } = useSearchData();
  const navigate = useNavigate();

  // Orders live in the buyers collection, not the users collection
  const orders = buyerData?.orders || [];

  if (dataLoading) return <Loading fullScreen={false} />;

  return (
    <div className="user-profile-content">
      <header style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>History Central</h2>
        <p style={{ color: '#64748b', fontSize: '15px' }}>Track your previous pet acquisitions and active marketplace activity.</p>
      </header>

      {/* 1. Fulfillment Discovery - Unified UserOrders Feature */}
      <UserOrders 
        orders={orders as any} 
        products={products as any} 
        onTrack={(id) => navigate(`/profile/order/${id}`)}
      />

      {/* 2. Secondary Discovery - Empty State Helper */}
      {orders.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '16px', border: '2px dashed #e2e8f0' }}>
           <FiPackage size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
           <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>Purchase History Clear</h3>
           <p style={{ color: '#64748b', marginBottom: '24px' }}>It looks like you haven't brought a pet home yet!</p>
           <button 
             onClick={() => navigate(ROUTES.MARKETPLACE)}
             style={{ padding: '12px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
           >
             <FiSearch /> Browse Marketplace
           </button>
        </div>
      )}
    </div>
  );
};

export default Profile;
