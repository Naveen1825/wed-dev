import React, { useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSearchData } from '@/hooks/useSearchData';
import { SellerHome } from '@/features/seller/SellerHome';
import { SellerListings } from '@/features/seller/SellerListings';
import { Loading } from '@/components/common/Loading';
import type { Seller, Product } from '@/types';

/**
 * Seller Dashboard Performance & Operations.
 * Orchestrates merchant store management, leveraging specialized SellerHome 
 * and SellerListings features to isolate analytics and inventory logic.
 * Refactored to eliminate duplicate stock management JSX by delegating to the feature-set.
 */
const SellerProfile: React.FC = () => {
  const { user } = useAuth();
  const { sellers, products, loading } = useSearchData();
  const [activeTab, setActiveTab] = useState<'overview' | 'listings'>('overview');

  // Resolve the active merchant document from Firestore synchronization
  const seller: Seller | null = useMemo(() => {
    if (!user) return null;
    const found = sellers.find(s => s.sellerId === user.uid);
    if (found) return found as Seller;
    
    // Virtual seller view for new merchants
    return {
      sellerId: user.uid,
      sellerName: user.displayName,
      sellerProfile: user.photoURL || 'https://www.w3schools.com/howto/img_avatar.png',
      sellerLocation: 'Global Platform',
      sellerEmail: user.email,
      sellerNumber: user.phone || 'Contact Private',
      productIds: [],
      analytics: {
        totalSales: 0, revenue: 0, storeViews: 0, conversion: 0, storeRating: 0, salesHistory: [0,0,0,0,0,0,0]
      }
    } as Seller;
  }, [sellers, user]);

  // Filter listings belonging to this merchant via productIds synchronization
  const sellerProducts = useMemo(() => 
    products.filter(p => seller?.productIds?.includes(p.productId)) as Product[], 
  [products, seller?.productIds]);

  if (loading) return <Loading fullScreen={false} />;
  if (!seller) return <div style={{ padding: '60px', textAlign: 'center' }}>Unable to resolve merchant credentials.</div>;

  return (
    <div className="seller-dashboard-content">
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
           <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Store Administration</h1>
           <p style={{ color: '#64748b', fontSize: '15px' }}>Operation oversight and performance tracking for {seller.sellerName}.</p>
        </div>
        
        {/* Portal Feature Toggles */}
        <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
           <button 
             onClick={() => setActiveTab('overview')}
             style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: 600, background: activeTab === 'overview' ? '#fff' : 'transparent', color: activeTab === 'overview' ? '#2563eb' : '#64748b', cursor: 'pointer', boxShadow: activeTab === 'overview' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none' }}
           >
             Performance Overview
           </button>
           <button 
             onClick={() => setActiveTab('listings')}
             style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: 600, background: activeTab === 'listings' ? '#fff' : 'transparent', color: activeTab === 'listings' ? '#2563eb' : '#64748b', cursor: 'pointer', boxShadow: activeTab === 'listings' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none' }}
           >
             Inventory Tracking
           </button>
        </div>
      </header>

      {/* 3. Portal Operational Views - Unified Features */}
      {activeTab === 'overview' ? (
        <SellerHome 
          seller={seller}
          products={sellerProducts}
        />
      ) : (
        <SellerListings 
          products={sellerProducts}
          onAdd={() => alert('Inventory system: Add interface triggered (Demo)')}
        />
      )}
    </div>
  );
};

export default SellerProfile;
