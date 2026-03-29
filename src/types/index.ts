export interface Review {
  userId: string;
  rating: number;
  comment: string;
  datetime: string;
}

export interface Address {
  name: string;
  phone: string;
  addressLine: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  type: string;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'admin' | 'seller' | 'buyer';
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  addresses?: Address[];
  orders?: Order[];
  createdAt?: string;
  lastLogin?: string;
}

export interface Product {
  productId: string;
  sellerId: string;
  sellerName: string;
  sellerLocation?: string;
  productPrice: number;
  productCategory: string;
  productSubCategory: string;
  productType: string;
  productAge: string;
  productGender: string;
  productMedia: string[];
  productReviews?: Review[];
  productVaccinated?: boolean;
  productIsPair?: boolean;
  productDescription?: string;
  status: 'active' | 'pending' | 'sold';
  newSalesCount?: number;
}

export interface Order {
  orderId: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  orderDate: string;
}

export interface Seller {
  sellerId: string;
  sellerName: string;
  sellerProfile: string;
  sellerLocation: string;
  sellerEmail: string;
  sellerNumber: string;
  productIds: string[];
  analytics?: {
    totalSales: number;
    revenue: number;
    storeViews: number;
    conversion: number;
    storeRating: number;
    salesHistory: number[];
  };
}

export interface Inquiry {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  productPrice: number;
  sellerName: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  message: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
}
