import { useState, useEffect } from 'react';

export interface User {
  UserId: string;
  sellerProfile: string;
  UserName: string;
  UserEmail: string;
  UserNumber: string;
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
}

export const useSearchData = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/products.json');
        const data = await response.json();
        
        // Simulating matching products with their sellers
        const joinedProducts = data.products.map((product: Product) => {
          const seller = data.sellers.find((s: Seller) => 
            s.productIds.includes(product.productId)
          );
          return {
            ...product,
            sellerLocation: seller ? seller.sellerLocation : 'Unknown Location',
            sellerName: seller ? seller.sellerName : 'Anonymous Seller'
          };
        });

        setProducts(joinedProducts);
        setSellers(data.sellers.map((s: any) => ({
          ...s,
          rating: 4.8, // Mocked rating
          pets: s.productIds.length
        })));
        setUsers(data.users || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { products, sellers, users, loading };
};
