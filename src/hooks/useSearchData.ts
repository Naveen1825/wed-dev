import { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../services/firebase/config';
import type { Product, Seller, User } from '@/types';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) return;

    // 1. Listen to Sellers for normalization and joining
    const unsubscribeSellers = onSnapshot(query(collection(db, 'sellers')), (snapshot) => {
      const sellerData = snapshot.docs.map(doc => ({
        ...(doc.data() as Seller),
        sellerId: doc.id
      }));
      setSellers(sellerData);
    }, (error) => {
      console.error('Firestore sellers sync error:', error);
    });

    // 2. Listen to Products
    const unsubscribeProducts = onSnapshot(query(collection(db, 'products')), (snapshot) => {
      const productData = snapshot.docs.map(doc => ({
        ...(doc.data() as Product),
        productId: doc.id
      }));
      setProducts(productData);
    }, (error) => {
      console.error('Firestore products sync error:', error);
    });

    // 3. Listen to Users
    const unsubscribeUsers = onSnapshot(query(collection(db, 'users')), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({
        ...(doc.data() as User),
        uid: doc.id
      })));
      setLoading(false);
    }, (error) => {
      console.error('Firestore users sync error:', error);
    });

    // Cleanup listeners on unmount
    return () => {
      unsubscribeSellers();
      unsubscribeProducts();
      unsubscribeUsers();
    };
  }, []);

  // Denormalize products with seller info (Joined View)
  const enrichedProducts = products.map(product => {
    const seller = sellers.find(s => s.productIds?.includes(product.productId));
    return {
      ...product,
      sellerLocation: seller?.sellerLocation || product.sellerLocation || 'Global Marketplace',
      sellerName: seller?.sellerName || product.sellerName || 'Verified Merchant',
      sellerId: seller?.sellerId || product.sellerId || 'unknown'
    };
  });

  return { 
    products: enrichedProducts as Product[], 
    sellers, 
    users, 
    loading 
  };
};
