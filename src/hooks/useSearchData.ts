import { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../services/firebase/config';
import type { Product, Seller, User, Buyer } from '@/types';

/**
 * Custom hook to manage fetching and processing global marketplace data.
 * Synchronizes in real-time with Firestore collections (products, sellers, users).
 * Centralizes distributed data models into a unified search and analytics context.
 * 
 * @returns {Object} products, sellers, users, and loading state.
 */
export const useSearchData = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const loadState = { sellers: false, products: false, users: false, buyers: false };
    const checkComplete = () => {
      if (loadState.sellers && loadState.products && loadState.users && loadState.buyers) {
        setLoading(false);
      }
    };

    // 1. Listen to Sellers for normalization and joining
    const unsubscribeSellers = onSnapshot(query(collection(db, 'sellers')), (snapshot) => {
      const sellerData = snapshot.docs.map(doc => ({
        ...(doc.data() as Seller),
        sellerId: doc.id
      }));
      setSellers(sellerData);
      loadState.sellers = true;
      checkComplete();
    }, (error) => {
      console.error('Firestore sellers sync error:', error);
      loadState.sellers = true;
      checkComplete();
    });

    // 2. Listen to Products
    const unsubscribeProducts = onSnapshot(query(collection(db, 'products')), (snapshot) => {
      const productData = snapshot.docs.map(doc => ({
        ...(doc.data() as Product),
        productId: doc.id
      }));
      setProducts(productData);
      loadState.products = true;
      checkComplete();
    }, (error) => {
      console.error('Firestore products sync error:', error);
      loadState.products = true;
      checkComplete();
    });

    // 3. Listen to Users
    const unsubscribeUsers = onSnapshot(query(collection(db, 'users')), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({
        ...(doc.data() as User),
        uid: doc.id
      })));
      loadState.users = true;
      checkComplete();
    }, (error) => {
      console.error('Firestore users sync error:', error);
      loadState.users = true;
      checkComplete();
    });

    // 4. Listen to Buyers
    const unsubscribeBuyers = onSnapshot(query(collection(db, 'buyers')), (snapshot) => {
      setBuyers(snapshot.docs.map(doc => ({
        ...(doc.data() as Buyer),
        buyerId: doc.id
      })));
      loadState.buyers = true;
      checkComplete();
    }, (error) => {
      console.error('Firestore buyers sync error:', error);
      loadState.buyers = true;
      checkComplete();
    });

    // Cleanup listeners on unmount
    return () => {
      unsubscribeSellers();
      unsubscribeProducts();
      unsubscribeUsers();
      unsubscribeBuyers();
    };
  }, []);

  // Denormalize products with seller info (Joined View)
  const enrichedProducts = products.map(product => {
    const seller = sellers.find(s => s.sellerId === product.sellerId);
    
    const enriched = {
      ...product,
      sellerLocation: product.sellerLocation || seller?.sellerLocation || 'Global Marketplace',
      sellerName: product.sellerName || seller?.shopName || 'Verified Merchant'
    };

    return enriched;
  });

  useEffect(() => {
    if (!loading && products.length > 0) {
      console.log('[Product Import] Registry loaded:', {
        total: products.length,
        enriched: enrichedProducts.length,
        sample: enrichedProducts[0]
      });
    }
  }, [loading, products, enrichedProducts]);

  const approvedProducts = enrichedProducts.filter(p => p.status === 'APPROVED');

  return { 
    products: enrichedProducts as Product[], 
    approvedProducts: approvedProducts as Product[],
    sellers, 
    users, 
    buyers,
    loading 
  };
};
