import { auth, db, googleProvider } from '../firebase/config';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  updateProfile as firebaseUpdateProfile,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import type { User, Seller, Buyer } from '@/types';

/**
 * Platform Authentication Service Layer.
 * Centralizes all Firebase Identity Management and User Profile Synchronization.
 */
export const AuthService = {
  async loginWithEmail(email: string, pass: string): Promise<User | null> {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    const userRef = doc(db, 'users', result.user.uid);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      return userDoc.data() as User;
    }
    return null;
  },

  async registerWithEmail(email: string, pass: string, role: 'buyer' | 'seller'): Promise<User> {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    const userId = result.user.uid;
    const initialProfile: User = {
      uid: userId,
      email: email,
      role: role,
      displayName: result.user.displayName || 'New User',
      photoURL: result.user.photoURL || 'https://www.w3schools.com/howto/img_avatar.png',
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'users', userId), initialProfile);

    if (role === 'seller') {
       await this.initializeSellerProfile(userId, result.user.phoneNumber || '');
    } else if (role === 'buyer') {
       await this.initializeBuyerProfile(userId, result.user.phoneNumber || '');
    }

    return initialProfile;
  },

  async loginWithGoogle(requestedRole: 'buyer' | 'seller'): Promise<{ user?: User; sellerData?: Seller | null; buyerData?: Buyer | null; requiresConfirmation?: boolean; pendingUserData?: User }> {
    const result = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;
    
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);
    
    let finalRole: 'buyer' | 'seller' | 'admin' | 'both' = requestedRole;
    let finalUserData: User;

    if (!userSnap.exists()) {
      const initialProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        role: requestedRole,
        displayName: firebaseUser.displayName || 'New User',
        photoURL: firebaseUser.photoURL || 'https://www.w3schools.com/howto/img_avatar.png',
        createdAt: new Date().toISOString()
      };
      await setDoc(userRef, initialProfile);
      finalUserData = initialProfile as User;
    } else {
      const userData = userSnap.data() as User;
      if (requestedRole === 'seller' && userData.role === 'buyer') {
        return { requiresConfirmation: true, pendingUserData: userData };
      } else {
        finalRole = userData.role;
      }
      finalUserData = userData;
    }

    let finalSellerData: Seller | null = null;
    let finalBuyerData: Buyer | null = null;

    // Fetch or Initialize Buyer specific record
    if (finalRole === 'buyer' || finalRole === 'both') {
       const buyerRef = doc(db, 'buyers', firebaseUser.uid);
       const buyerSnap = await getDoc(buyerRef);
       if (!buyerSnap.exists()) {
          finalBuyerData = await this.initializeBuyerProfile(firebaseUser.uid, firebaseUser.phoneNumber || '');
       } else {
          finalBuyerData = buyerSnap.data() as Buyer;
       }
    }

    // Fetch or Initialize Merchant specific record
    if (finalRole === 'seller' || finalRole === 'both') {
       const sellerRef = doc(db, 'sellers', firebaseUser.uid);
       const sellerSnap = await getDoc(sellerRef);
       if (!sellerSnap.exists()) {
          finalSellerData = await this.initializeSellerProfile(firebaseUser.uid, firebaseUser.phoneNumber || '');
       } else {
          finalSellerData = sellerSnap.data() as Seller;
       }
    }

    return { user: finalUserData, sellerData: finalSellerData, buyerData: finalBuyerData };
  },

  async initializeSellerProfile(uid: string, phone: string): Promise<Seller> {
     const sellerRef = doc(db, 'sellers', uid);
     const newSellerProfile: Seller = {
        sellerId: uid,
        sellerLocation: 'Pending Verification',
        sellerNumber: phone,
        shopName: '', 
        sellerCertificateUrl: '',
        shopPhotoUrls: [],
        productIds: [],
        status: 'onboarding', 
        analytics: { totalSales: 0, revenue: 0, storeViews: 0, conversion: 0, storeRating: 0, salesHistory: [] }
     };
     await setDoc(sellerRef, newSellerProfile);
     return newSellerProfile;
  },

  async initializeBuyerProfile(uid: string, phone: string): Promise<Buyer> {
     const buyerRef = doc(db, 'buyers', uid);
     const newBuyerProfile: Buyer = {
        buyerId: uid,
        phone: phone,
        dateOfBirth: '',
        gender: '',
        addresses: [],
        orders: [],
        status: 'onboarding'
     };
     await setDoc(buyerRef, newBuyerProfile);
     return newBuyerProfile;
  },

  async upgradeToDualRole(uid: string, phone: string = ''): Promise<{ user: User; sellerData: Seller; buyerData: Buyer }> {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { role: 'both' });
    
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data() as User;

    let finalSellerData: Seller;
    const sellerRef = doc(db, 'sellers', uid);
    const sellerSnap = await getDoc(sellerRef);
    
    if (!sellerSnap.exists()) {
       finalSellerData = await this.initializeSellerProfile(uid, phone);
    } else {
       finalSellerData = sellerSnap.data() as Seller;
    }

    let finalBuyerData: Buyer;
    const buyerRef = doc(db, 'buyers', uid);
    const buyerSnap = await getDoc(buyerRef);
    if (!buyerSnap.exists()) {
       finalBuyerData = await this.initializeBuyerProfile(uid, phone);
    } else {
       finalBuyerData = buyerSnap.data() as Buyer;
    }

    return { user: userData, sellerData: finalSellerData, buyerData: finalBuyerData };
  },

  async updateUserInfo(uid: string, data: Partial<User>) {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, data);
    
    if ((data.displayName || data.photoURL) && auth.currentUser) {
      await firebaseUpdateProfile(auth.currentUser, {
        displayName: data.displayName,
        photoURL: data.photoURL
      });
    }
  },

  async updateSellerInfo(uid: string, data: Partial<Seller>) {
    const sellerRef = doc(db, 'sellers', uid);
    await updateDoc(sellerRef, data);
  },

  async updateBuyerInfo(uid: string, data: Partial<Buyer>) {
    const buyerRef = doc(db, 'buyers', uid);
    await updateDoc(buyerRef, data);
  },

  async logout() {
    await signOut(auth);
  }
};
