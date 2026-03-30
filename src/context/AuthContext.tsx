import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/services/firebase/config';
import { AuthService } from '@/services/api/AuthService';
import type { User, Seller, Buyer } from '@/types';

interface AuthContextType {
  user: User | null;
  sellerData: Seller | null;
  buyerData: Buyer | null;
  loading: boolean;
  role: 'admin' | 'buyer' | 'seller' | 'both' | null;
  isProfileComplete: boolean;
  isSellerVerified: boolean;
  login: (email: string, pass: string) => Promise<User | null>;
  register: (email: string, pass: string, role: 'buyer' | 'seller') => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  updateBuyerProfile: (data: Partial<Buyer>) => Promise<void>;
  loginWithGoogle: (role: 'buyer' | 'seller') => Promise<{ user?: User | null; sellerStatus?: string; requiresConfirmation?: boolean; pendingUserData?: User }>;
  upgradeToDualRole: (uid: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Global Authentication Context Provider.
 * Abstracted to use AuthService for explicit separation of concerns.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [sellerData, setSellerData] = useState<Seller | null>(null);
  const [buyerData, setBuyerData] = useState<Buyer | null>(null);
  const [loading, setLoading] = useState(true);

  // Derived State Configuration
  const role = user?.role || null;
  
  // Profile completion determinant logic across roles
  const isProfileComplete = React.useMemo(() => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.role === 'buyer') return !!buyerData?.phone;
    if (user.role === 'seller') return sellerData?.status !== 'onboarding';
    if (user.role === 'both') return !!buyerData?.phone && sellerData?.status !== 'onboarding';
    return false;
  }, [user, sellerData, buyerData]);

  const isSellerVerified = sellerData?.status === 'verified';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true); // Ensure lockout while fetching
      try {
        if (firebaseUser) {
          // Fetch extended profile database document
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            let userData = userDoc.data() as User;
            setUser(userData);

            // Conditional Deep Fetch for Merchant profiles
            if (userData.role === 'seller' || userData.role === 'both') {
              const sellerRef = doc(db, 'sellers', firebaseUser.uid);
              const sellerDoc = await getDoc(sellerRef);
              if (sellerDoc.exists()) {
                let sData = sellerDoc.data() as Seller;
                sData.productIds = sData.productIds || [];
                sData.analytics = sData.analytics || { totalSales: 0, revenue: 0, storeViews: 0, conversion: 0, storeRating: 0, salesHistory: [] };
                sData.status = sData.status || 'pending';
                setSellerData(sData);
              } else {
                setSellerData(null);
              }
            } else {
              setSellerData(null);
            }

            // Deep fetch for Buyer data
            if (userData.role === 'buyer' || userData.role === 'both') {
              const buyerRef = doc(db, 'buyers', firebaseUser.uid);
              const buyerDoc = await getDoc(buyerRef);
              if (buyerDoc.exists()) {
                setBuyerData(buyerDoc.data() as Buyer);
              } else {
                setBuyerData(null);
              }
            } else {
              setBuyerData(null);
            }
          } else {
             // User deleted from firestore but session alive
            setUser(null);
            setSellerData(null);
            setBuyerData(null);
          }
        } else {
          setUser(null);
          setSellerData(null);
          setBuyerData(null);
        }
      } catch (err) {
        console.error('Session Hydration Error:', err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    const userData = await AuthService.loginWithEmail(email, pass);
    setUser(userData);
    return userData;
  };

  const register = async (email: string, pass: string, reqRole: 'buyer' | 'seller') => {
    const userData = await AuthService.registerWithEmail(email, pass, reqRole);
    setUser(userData);
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!auth.currentUser) return;
    await AuthService.updateUserInfo(auth.currentUser.uid, data);
    setUser(prev => prev ? { ...prev, ...data } : null);
  };

  const updateBuyerProfile = async (data: Partial<Buyer>) => {
    if (!auth.currentUser) return;
    await AuthService.updateBuyerInfo(auth.currentUser.uid, data);
    setBuyerData(prev => prev ? { ...prev, ...data } : null);
  };

  const loginWithGoogle = async (requestedRole: 'buyer' | 'seller') => {
    const response = await AuthService.loginWithGoogle(requestedRole);
    if (response.requiresConfirmation) {
       return response;
    }
    const { user: userData, sellerData: sData, buyerData: bData } = response;
    if (userData) setUser(userData);
    if (sData) setSellerData(sData);
    if (bData) setBuyerData(bData);
    return { user: userData, sellerStatus: sData?.status };
  };

  const upgradeToDualRole = async (uid: string) => {
    const { user: userData, sellerData: sData, buyerData: bData } = await AuthService.upgradeToDualRole(uid, buyerData?.phone);
    setUser(userData);
    setSellerData(sData);
    setBuyerData(bData);
  };

  const logout = async () => {
    await AuthService.logout();
    localStorage.removeItem('anisell_user_details');
    setUser(null);
    setSellerData(null);
    setBuyerData(null);
  };

  return (
    <AuthContext.Provider value={{ 
       user, sellerData, buyerData, loading, role, isProfileComplete, isSellerVerified, 
       login, register, updateProfile, updateBuyerProfile, loginWithGoogle, upgradeToDualRole, logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
