import React, { useMemo } from 'react';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useSearchData } from '@/hooks/useSearchData';
import { SellerHome } from '@/features/seller/SellerHome';
import { SellerListings } from '@/features/seller/SellerListings';
import { Loading } from '@/components/common/Loading';
import { ROUTES } from '@/constants/routes';
import { ProductForm } from '@/features/seller/ProductForm';
import { FiX, FiMenu } from 'react-icons/fi';
import { doc, deleteDoc, updateDoc, arrayRemove } from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import type { Seller, Product } from '@/types';
import styles from './SellerDashboard.module.css';

/**
 * Seller Dashboard Performance & Operations.
 * Orchestrates merchant store management, leveraging specialized SellerHome 
 * and SellerListings features to isolate analytics and inventory logic.
 * Now passes real Firestore orders to SellerHome for analytics derivation.
 */
const SellerProfile: React.FC = () => {
  const { toggleMenu } = useOutletContext<{ toggleMenu: () => void }>();
  const { user, sellerData, buyerData, isSellerVerified } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { sellers, products, buyers, users, loading: globalLoading } = useSearchData();
  const [isAddingProduct, setIsAddingProduct] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState('');
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  
  // Use routing to determine active tab for true sidebar sync
  const activeTab = location.pathname.includes('/products') ? 'listings' : 'overview';

  // Auto-clear success messages for a cleaner workspace
  React.useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Handle tab transitions with a premium loading experience
  const handleTabChange = (path: string) => {
    setIsTransitioning(true);
    navigate(path);
    setTimeout(() => setIsTransitioning(false), 400); // Simulate smooth transition
  };

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

  if (globalLoading || isTransitioning) return <Loading fullScreen={false} message={isTransitioning ? "Fetching Inventory..." : "Synchronizing Platform..."} />;
  if (!seller) return <div style={{ padding: '60px', textAlign: 'center' }}>Unable to resolve merchant credentials.</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerInfo}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
             <h1>Store Administration</h1>
             <button 
               className={styles.mobileMenuTrigger} 
               onClick={toggleMenu}
               style={{ display: 'none', background: 'none', border: 'none', padding: '0', cursor: 'pointer' }}
             >
               <FiMenu size={24} color="#1e293b" />
             </button>
           </div>
           <p>Operation oversight and performance tracking for {seller.shopName}.</p>
        </div>
        
        {/* Portal Feature Toggles */}
        <div className={styles.toggles}>
           <button 
             onClick={() => handleTabChange(ROUTES.SELLER_DASHBOARD)}
             className={`${styles.toggleBtn} ${activeTab === 'overview' ? styles.toggleBtnActive : styles.toggleBtnInactive}`}
           >
             Performance Overview
           </button>
           <button 
             onClick={() => handleTabChange(ROUTES.SELLER_DASHBOARD + '/products')}
             className={`${styles.toggleBtn} ${activeTab === 'listings' ? styles.toggleBtnActive : styles.toggleBtnInactive}`}
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
