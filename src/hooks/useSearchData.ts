import { useState, useEffect } from 'react';

/**
 * --- Type Definitions ---
 */

/**
 * Address interface for user profiles and delivery locations.
 */
export interface Address {
  type: string;
  name: string;
  phone: string;
  pincode: string;
  locality: string;
  addressLine: string;
  city: string;
  state: string;
}

/**
 * Simple order structure for buyer history.
 */
export interface Order {
  orderId: string;
  productId: string;
  orderDate: string;
  status: string;
  amount: number;
}

/**
 * Main User interface, supporting both live auth data and legacy mock details.
 */
export interface User {
  uid: string;
  displayName: string;
  email: string;
  phone: string;
  photoURL?: string;
  dateOfBirth?: string;
  gender?: string;
  addresses?: Address[];
  orders?: Order[];
  role?: string;
  // Legacy fields for backward compatibility with mock JSON
  UserId?: string;
  UserName?: string;
  UserEmail?: string;
  UserNumber?: string;
  Gender?: string;
  sellerProfile?: string;
}

export interface Review {
  userId: string;
  comment: string;
  datetime: string;
  rating: number;
}

export interface Product {
  productId: string;
  productCategory: string;
  productSubCategory: string;
  productDescription: string;
  productAge: string;
  productGender: string;
  productPrice: number;
  productMedia: string[];
  productVaccinated: boolean;
  productIsPair: boolean;
  productType: string;
  productReviews: Review[];
  oldSalesCount?: number;
  newSalesCount?: number;
  sellerLocation?: string;
  sellerName?: string;
}

export interface Seller {
  sellerId: string;
  sellerName: string;
  sellerLocation: string;
  sellerProfile: string;
  productIds: string[];
  rating: number;
  pets: number;
  dateOfBirth?: string;
  Gender?: string;
  addresses?: Address[];
  analytics?: {
    totalSales: number;
    revenue: number;
    storeViews: number;
    conversion: number;
    storeRating: number;
    salesHistory: number[];
  };
}

/**
 * --- Custom Hook ---
 */

/**
 * Fetches and processes marketplace data from products.json.
 * Joins products with their respective sellers for enhanced display.
 */
/**
 * Custom hook to manage fetching and processing global marketplace data.
 * Currently reads from a static JSON file as a mock backend.
 * Provides a mount-safe data ingestion pattern for React components.
 * 
 * @returns {Object} products, sellers, users, and loading state.
 */
export const useSearchData = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    /**
     * Internal async fetcher for products.json.
     * Enriches the raw dataset with context-aware joins.
     */
    const fetchData = async () => {
      try {
        const response = await fetch('/products.json');
        if (!response.ok) throw new Error('Data fetch failed');
        
        const data = await response.json();
        
        if (!isMounted) return;

        /**
         * Perform a Left Join: Enriches each product with its owner's 
         * location and name to avoid secondary lookups in UI cards.
         */
        const joinedProducts = data.products.map((product: Product) => {
          const seller = data.sellers.find((s: Seller) => 
            s.productIds.includes(product.productId)
          );
          return {
            ...product,
            sellerLocation: seller?.sellerLocation || 'Unknown Location',
            sellerName: seller?.sellerName || 'Anonymous Seller'
          };
        });

        setProducts(joinedProducts);
        
        /**
         * Normalize seller objects for dashboard display.
         */
        setSellers(data.sellers.map((s: any) => ({
          ...s,
          rating: s.analytics?.storeRating || 5.0,
          pets: s.productIds?.length || 0
        })));
        
        setUsers(data.users || []);
      } catch (error) {
        console.error('Core data ingestion error:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    // Cleanup to prevent state updates on unmounted components
    return () => { isMounted = false; };
  }, []);

  return { products, sellers, users, loading };
};
