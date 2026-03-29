import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '../services/firebase';
import './Login.css';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role'); // 'seller' or 'user' (buyer)

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Main authentication handler using Firebase Google Auth.
   * Orchestrates account creation, conditional data seeding from products.json, 
   * and role-based redirects.
   */
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!auth || !googleProvider || !db) {
        throw new Error('Firebase is not configured correctly.');
      }
      
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // 1. Check for existing Firestore record for the authenticated user
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      let finalRole: string;

      if (!userSnap.exists()) {
        /**
         * ─── NEW USER ONBOARDING ───
         * On initial signup, we check for 'mock profiles' in products.json.
         * If the email exists there, we seed the Firestore profile with 
         * existing mock data to simulate a populated professional account.
         */
        finalRole = roleParam === 'seller' ? 'seller' : 'buyer';
        
        let additionalDetails = {};
        try {
          // Fetch the mock dataset for matching
          const response = await fetch('/products.json');
          if (response.ok) {
            const data = await response.json();
            const mockUser = data.users.find((u: any) => u.UserEmail.toLowerCase() === user.email?.toLowerCase());
            const mockSeller = data.sellers.find((s: any) => s.sellerEmail?.toLowerCase() === user.email?.toLowerCase());
            
            if (mockUser) {
              // Populate from user mock
              additionalDetails = {
                phone: mockUser.UserNumber || '',
                dateOfBirth: mockUser.dateOfBirth || '',
                gender: mockUser.Gender || '',
                addresses: mockUser.addresses || []
              };
              console.log('Matched mock user data for:', user.email);
            } else if (mockSeller) {
              // Populate from seller mock and force role
              additionalDetails = {
                phone: mockSeller.sellerNumber || '',
                addresses: mockSeller.addresses || [],
                certification: mockSeller.sellerCertificate || '',
                location: mockSeller.sellerLocation || '',
                analytics: mockSeller.analytics || null, 
                role: 'seller'
              };
              finalRole = 'seller';
              console.log('Matched mock seller data for:', user.email);
            }
          }
        } catch (e) {
          console.warn('Could not fetch products.json for mock data enrichment:', e);
        }

        // Write the initial profile to Firestore
        await setDoc(userRef, {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          role: finalRole,
          ...additionalDetails,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp()
        });
        console.log(`New user registered as ${finalRole}`);
      } else {
        /**
         * ─── EXISTING USER PATH ───
         * Handle role upgrades (e.g., from buyer to seller) and last-login tracking.
         */
        const userData = userSnap.data();
        const existingRole = userData.role || 'buyer';

        // Check if user is requesting a role upgrade via the registration path
        if (roleParam === 'seller' && existingRole === 'buyer') {
          await setDoc(userRef, { role: 'seller' }, { merge: true });
          finalRole = 'seller';
        } else {
          finalRole = existingRole;
        }
        
        // Always update last login timestamp for analytics
        await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
        console.log(`Existing user logged in as ${finalRole}`);
      }
      
      // Navigate to the appropriate dashboard
      if (finalRole === 'seller' || finalRole === 'admin') {
        navigate('/admin'); 
      } else {
        navigate('/');
      }
    } catch (err: any) {
      console.error('Firebase Auth Error:', err);
      setError(err.message || 'Failed to authenticate with Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <img
              src="https://anisell.in/wp-content/uploads/2025/06/91-93450-29589-1.png"
              alt="AniSell Logo"
              className="login-logo"
            />
            <h1>Welcome to AniSell</h1>
            <p>Sign in to access your profile, post listings, and manage your account.</p>
          </div>

          <div className="login-body">
            {error && (
              <div style={{ color: '#d32f2f', background: '#ffebee', padding: '10px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', border: '1px solid #ffcdd2' }}>
                {error}
              </div>
            )}
            <button className="google-login-btn" onClick={handleGoogleLogin} disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
              <FcGoogle className="google-icon" />
              <span>{loading ? 'Please wait...' : 'Continue with Google'}</span>
            </button>
          </div>

          <div className="login-footer">
            <p>
              By signing in, you agree to our{' '}
              <a href="#">Terms of Service</a> and{' '}
              <a href="#">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
