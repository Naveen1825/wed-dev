import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useSearchData } from '@/hooks/useSearchData';
import { SellerHome } from '@/features/seller/SellerHome';
import { SellerListings } from '@/features/seller/SellerListings';
import { Loading } from '@/components/common/Loading';
import { ROUTES } from '@/constants/routes';
import { ProductForm } from '@/features/seller/ProductForm';
import { FiX } from 'react-icons/fi';
import { doc, deleteDoc, updateDoc, arrayRemove } from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import type { Seller, Product } from '@/types';

/**
 * Seller Dashboard Performance & Operations.
 * Orchestrates merchant store management, leveraging specialized SellerHome 
 * and SellerListings features to isolate analytics and inventory logic.
 * Now passes real Firestore orders to SellerHome for analytics derivation.
 */
const SellerProfile: React.FC = () => {
  const { user, sellerData, buyerData, isSellerVerified } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { sellers, products, buyers, users, loading } = useSearchData();
  const [isAddingProduct, setIsAddingProduct] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState('');
  
  // Use routing to determine active tab for true sidebar sync
  const activeTab = location.pathname.includes('/products') ? 'listings' : 'overview';

  // Resolve the active merchant document from Firestore synchronization
  const seller: Seller | null = useMemo(() => {
    if (!user) return null;
    const found = sellers.find(s => s.sellerId === user.uid);
    if (found) return found as Seller;
    
    // Virtual seller view for new merchants
    return {
      sellerId: user.uid,
      shopName: sellerData?.shopName || user.displayName,
      sellerLocation: 'Global Platform',
      sellerNumber: sellerData?.sellerNumber || buyerData?.phone || 'Contact Private',
      productIds: [],
    } as Seller;
  }, [sellers, user, sellerData, buyerData]);

  // Filter listings belonging to this merchant
  const sellerProducts = useMemo(() => 
    products.filter(p => p.sellerId === user?.uid) as Product[], 
  [products, user?.uid]);

  // Derive orders placed on this seller's products from real Firestore buyer data
  const sellerOrders = useMemo(() => {
    if (!user) return [];
    const sellerProductIds = sellerProducts.map(p => p.productId);
    
    return buyers.flatMap(b => {
      const buyerUser = users.find(u => u.uid === b.buyerId);
      return (b.orders || [])
        .filter(o => o.sellerId === user.uid || sellerProductIds.includes(o.productId))
        .map(order => {
          const product = products.find(p => p.productId === order.productId);
          return {
            order,
            buyerName: buyerUser?.displayName || 'Marketplace Buyer',
            productName: product?.productSubCategory || 'Pet Listing'
          };
        });
    }).sort((a, b) => new Date(b.order.orderDate).getTime() - new Date(a.order.orderDate).getTime());
  }, [buyers, users, user, sellerProducts, products]);

  if (loading) return <Loading fullScreen={false} />;
  if (!seller) return <div style={{ padding: '60px', textAlign: 'center' }}>Unable to resolve merchant credentials.</div>;

  return (
    <div className="seller-dashboard-content">
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
           <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Store Administration</h1>
           <p style={{ color: '#64748b', fontSize: '15px' }}>Operation oversight and performance tracking for {seller.shopName}.</p>
        </div>
        
        {/* Portal Feature Toggles */}
        <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
           <button 
             onClick={() => navigate(ROUTES.SELLER_DASHBOARD)}
             style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: 600, background: activeTab === 'overview' ? '#fff' : 'transparent', color: activeTab === 'overview' ? '#2563eb' : '#64748b', cursor: 'pointer', boxShadow: activeTab === 'overview' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none' }}
           >
             Performance Overview
           </button>
           <button 
             onClick={() => navigate(ROUTES.SELLER_DASHBOARD + '/products')}
             style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: 600, background: activeTab === 'listings' ? '#fff' : 'transparent', color: activeTab === 'listings' ? '#2563eb' : '#64748b', cursor: 'pointer', boxShadow: activeTab === 'listings' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none' }}
           >
             Inventory Tracking
           </button>
        </div>
      </header>

      {successMessage && (
        <div style={{ background: '#ecfdf5', color: '#065f46', padding: '12px 20px', borderRadius: '12px', marginBottom: '24px', fontWeight: 600, border: '1px solid #10b981', display: 'flex', justifyContent: 'space-between', animation: 'fadeIn 0.3s ease' }}>
          {successMessage}
          <button onClick={() => setSuccessMessage('')} style={{ background: 'none', border: 'none', color: '#065f46', cursor: 'pointer' }}><FiX /></button>
        </div>
      )}

      {/* Portal Operational Views */}
      {activeTab === 'overview' ? (
        <SellerHome 
          seller={seller}
          products={sellerProducts}
          sellerOrders={sellerOrders}
        />
      ) : (
        <SellerListings 
          products={sellerProducts}
          isVerified={isSellerVerified}
          onAdd={() => setIsAddingProduct(true)}
          onEdit={(productId) => {
            navigate(`/product/${productId}`);
          }}
          onDelete={async (productId) => {
            if (!window.confirm('Are you sure you want to remove this listing from the marketplace?')) return;
            try {
              await deleteDoc(doc(db, 'products', productId));
              await updateDoc(doc(db, 'sellers', seller.sellerId), {
                productIds: arrayRemove(productId)
              });
              setSuccessMessage('Listing removed from the marketplace successfully.');
            } catch (err: any) {
              console.error('Failed to delete product:', err);
              alert('Failed to remove listing. Please try again.');
            }
          }}
        />
      )}

      {isAddingProduct && (
        <ProductForm 
          sellerId={seller.sellerId}
          onClose={() => setIsAddingProduct(false)}
          onSuccess={() => {
            setSuccessMessage('Product listed successfully. Waiting for administrative verification.');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}
    </div>
  );
};

export default SellerProfile;
