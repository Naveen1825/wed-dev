import { auth, db, googleProvider } from '../firebase/config';
import { 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';

/**
 * Platform Authentication Service Layer.
 * Centralizes all Firebase Identity Management and User Profile Synchronization.
 * Strictly adheres to the requirement that no direct API/Firebase calls exist inside components.
 */
export const AuthService = {
  /**
   * Registers a merchant and initializes their marketplace document.
   */
  async registerSeller(email: string, pass: string, data: any) {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    const userId = res.user.uid;

    await updateProfile(res.user, { 
      displayName: data.shopName,
      photoURL: data.logo || 'https://www.w3schools.com/howto/img_avatar.png' 
    });

    const merchantDoc = {
      uid: userId,
      role: 'seller',
      shopName: data.shopName,
      email: email,
      phone: data.phone,
      verificationStatus: 'pending',
      onboardingComplete: true,
      joinDate: new Date().toISOString()
    };

    await setDoc(doc(db, 'users', userId), merchantDoc);
    return merchantDoc;
  },

  /**
   * Standardizes user profile updates across role-based viewports.
   */
  async updateUserInfo(uid: string, data: any) {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, data);
  },

  /**
   * Orchestrates high-fidelity Google Identity acquisition and marketplace onboarding.
   */
  async loginWithGoogle() {
    const result = await signInWithPopup(auth, googleProvider);
    const { user } = result;
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // First-time identity syncronization logic
      const newUser = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'Unverified Marketplace User',
        photoURL: user.photoURL || '',
        role: 'buyer',
        joinDate: new Date().toISOString(),
        onboardingComplete: false
      };
      await setDoc(userRef, newUser);
      return newUser;
    }
    return userSnap.data();
  },

  /**
   * Standardizes user and merchant logout flows.
   */
  async logout() {
    await signOut(auth);
  }
};
