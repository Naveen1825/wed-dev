import { useState, useEffect } from 'react';

/**
 * --- Type Definitions ---
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

export interface User {
  UserId: string;
  sellerProfile: string;
  UserName: string;
  UserEmail: string;
  UserNumber: string;
  dateOfBirth?: string;
  Gender?: string;
  addresses?: Address[];
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
export const useSearchData = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const response = await fetch('/products.json');
        if (!response.ok) throw new Error('Data fetch failed');
        
        const data = await response.json();
        
        if (!isMounted) return;

        // Map products with seller context
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
        
        // Enrich seller objects
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

    return () => { isMounted = false; };
  }, []);

  return { products, sellers, users, loading };
};
