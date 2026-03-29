import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup, 
  signOut, 
  updateProfile as firebaseUpdateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/services/firebase/config';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<User | null>;
  register: (email: string, pass: string, role: 'buyer' | 'seller') => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  loginWithGoogle: (role: 'buyer' | 'seller') => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Global Authentication Context Provider.
 * Synchronizes Firebase Auth state with the application's User profile in Firestore.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch extended profile database document
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          setUser(userDoc.data() as User);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    const userRef = doc(db, 'users', result.user.uid);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const userData = userDoc.data() as User;
      setUser(userData);
      return userData;
    }
    return null;
  };

  const register = async (email: string, pass: string, role: 'buyer' | 'seller') => {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    const userId = result.user.uid;
    const initialProfile = {
      uid: userId,
      email: email,
      role: role,
      displayName: result.user.displayName || 'New User',
      photoURL: result.user.photoURL || 'https://www.w3schools.com/howto/img_avatar.png',
      joinDate: new Date().toISOString()
    };
    await setDoc(doc(db, 'users', userId), initialProfile);
    setUser(initialProfile as User);
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!auth.currentUser) return;
    const userRef = doc(db, 'users', auth.currentUser.uid);
    await updateDoc(userRef, data);
    
    // Update firebase user if display name/photo changed
    if (data.displayName || data.photoURL) {
      await firebaseUpdateProfile(auth.currentUser, {
        displayName: data.displayName,
        photoURL: data.photoURL
      });
    }

    setUser(prev => prev ? { ...prev, ...data } : null);
  };

  const loginWithGoogle = async (requestedRole: 'buyer' | 'seller') => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        const initialProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          role: requestedRole,
          displayName: firebaseUser.displayName || 'New User',
          photoURL: firebaseUser.photoURL || 'https://www.w3schools.com/howto/img_avatar.png',
          joinDate: new Date().toISOString()
        };
        await setDoc(userRef, initialProfile);
        setUser(initialProfile as User);
      } else {
        const userData = userSnap.data() as User;
        if (requestedRole === 'seller' && userData.role === 'buyer') {
          await setDoc(userRef, { role: 'seller' }, { merge: true });
          setUser({ ...userData, role: 'seller' });
        } else {
          setUser(userData);
        }
      }
    } catch (error) {
      console.error('Google Auth Error:', error);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem('anisell_user_details');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, updateProfile, loginWithGoogle, logout }}>
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
