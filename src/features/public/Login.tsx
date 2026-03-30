import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/constants/routes';
import { Input } from '@/components/ui/Input';
import { FcGoogle } from 'react-icons/fc';
import styles from './Login.module.css';

/**
 * Modern Platform Onboarding Hub.
 * Exclusively utilizes Google SSO for high-fidelity identity acquisition.
 * Refactored to eliminate legacy email/password vectors and streamline discovery.
 */
const Login: React.FC = () => {
  const location = useLocation();
  const [isRegister, setIsRegister] = useState(location.state?.isRegister || false);
  const [requestedRole, setRequestedRole] = useState<'buyer' | 'seller'>(location.state?.role || 'buyer');
  const [isRoleLocked] = useState(location.state?.lockRole || false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingUid, setPendingUid] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { loginWithGoogle, upgradeToDualRole } = useAuth();

  const handleGoogleAuth = async () => {
    setError('');
    setLoading(true);
    try {
      const authData = await loginWithGoogle(requestedRole);
      
      if (authData?.requiresConfirmation && authData.pendingUserData) {
         setPendingUid(authData.pendingUserData.uid);
         setShowConfirmation(true);
         return;
      }
      
      let redirectPath: string = ROUTES.USER_PROFILE; // Default fallback Base Path
      if (authData?.user?.role === 'admin') redirectPath = ROUTES.ADMIN_DASHBOARD;
      if (authData?.user?.role === 'both' || authData?.user?.role === 'seller') redirectPath = ROUTES.SELLER_DASHBOARD;
      if (authData?.user?.role === 'buyer') redirectPath = ROUTES.USER_PROFILE;
      
      navigate(redirectPath);
    } catch (err: any) {
      setError(err.message || 'Identity acquisition failed. Please try again.');
    } finally {
      if (!showConfirmation) setLoading(false);
    }
  };

  const handleConfirmDualRole = async () => {
     if (!pendingUid) return;
     setError('');
     setLoading(true);
     setShowConfirmation(false);
     try {
        await upgradeToDualRole(pendingUid);
        navigate(ROUTES.SELLER_DASHBOARD);
     } catch (err: any) {
        setError(err.message || 'Identity extension failed.');
        setLoading(false);
     }
  };

  return (
    <div className={styles.page}>
      
      {/* 1. High-Fidelity Google Entry Port */}
      <div className={styles.authCard}>
        <header className={styles.header}>
          <h1 className={styles.title}>{isRegister ? (isRoleLocked && requestedRole === 'seller' ? 'Join as Merchant' : 'Join the Community') : 'Welcome Back'}</h1>
          <p className={styles.subtitle}>{isRoleLocked && requestedRole === 'seller' ? 'Authenticate below to begin scaling your storefront.' : 'The premier marketplace for verified pet listings.'}</p>
        </header>

        <div className={styles.form}>
          {isRegister && !isRoleLocked && (
             <div style={{ marginBottom: '8px' }}>
               <Input 
                 label="I want to join as" 
                 as="select" 
                 value={requestedRole}
                 onChange={e => setRequestedRole(e.target.value as any)}
               >
                 <option value="buyer">Individual Buyer</option>
                 <option value="seller">Verified Merchant</option>
               </Input>
             </div>
          )}

          <button 
            className={styles.googleBtn} 
            onClick={handleGoogleAuth} 
            disabled={loading}
          >
            <FcGoogle size={24} />
            <span>{loading ? 'Orchestrating Identity...' : (isRegister ? 'Register with Google' : 'Sign in with Google')}</span>
          </button>

          {error && <div className={styles.error}>{error}</div>}
        </div>

        <footer className={styles.toggle}>
          {isRegister ? 'Already an active participant?' : "New to the marketplace?"} 
          <span className={styles.toggleBtn} onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? ' Sign In' : ' Create Identity'}
          </span>
        </footer>
      </div>

      {showConfirmation && (
         <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
               <h2>Confirm Merchant Registration</h2>
               <p>You are already registered as a buyer. Creating a seller profile will not replace your buyer account. Do you want to continue?</p>
               <div className={styles.modalActions}>
                  <button className="button-base button-outline" onClick={() => { setShowConfirmation(false); setLoading(false); }}>Cancel</button>
                  <button className="button-base button-primary" onClick={handleConfirmDualRole}>Confirm & Continue</button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default Login;
