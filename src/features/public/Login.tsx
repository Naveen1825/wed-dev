import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/constants/routes';
import { Input } from '@/components/ui/Input';
import { FcGoogle } from 'react-icons/fc';
import { isAdminSubdomain } from '@/utils/subdomain';
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
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const navigate = useNavigate();
  const { loginWithGoogle, loginAdmin, convertToSeller } = useAuth();
  const isAdm = isAdminSubdomain();

  const handleAdminAuth = async (e: React.FormEvent) => {
     e.preventDefault();
     setError('');
     setLoading(true);
     try {
        await loginAdmin(email, password);
        navigate('/profile'); // On admin subdomain, /profile is the dashboard root
     } catch (err: any) {
        setError(err.message || 'Governance Access Refused: Invalid Credentials.');
     } finally {
        setLoading(false);
     }
  };

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
      if (authData?.user?.role === 'seller') redirectPath = ROUTES.SELLER_DASHBOARD;
      if (authData?.user?.role === 'buyer') redirectPath = ROUTES.USER_PROFILE;
      
      navigate(redirectPath);
    } catch (err: any) {
      setError(err.message || 'Identity acquisition failed. Please try again.');
    } finally {
      if (!showConfirmation) setLoading(false);
    }
  };

  const handleConfirmConversion = async () => {
     if (!pendingUid) return;
     setError('');
     setLoading(true);
     setShowConfirmation(false);
     try {
        await convertToSeller(pendingUid);
        navigate(ROUTES.SELLER_DASHBOARD);
     } catch (err: any) {
        setError(err.message || 'Identity conversion failed.');
        setLoading(false);
     }
  };

  return (
    <div className={`${styles.page} ${isAdm ? styles.adminPage : (requestedRole === 'seller' ? styles.merchantPage : styles.userPage)}`}>
      
      {/* 1. High-Fidelity Google Entry Port */}
      <div className={`${styles.authCard} ${isAdm ? styles.adminCard : (requestedRole === 'seller' ? styles.merchantCard : styles.userCard)}`}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            {isAdm ? 'System Governance' : (requestedRole === 'seller' ? 'Merchant Portal' : 'User Portal')}
          </h1>
          <p className={styles.subtitle}>
             {isAdm ? 'Administrative control center' : (isRegister ? `Register as a platform ${requestedRole === 'seller' ? 'Merchant' : 'User'}` : `${requestedRole === 'seller' ? 'Merchant' : 'User'} Login`)}
          </p>
        </header>

        <div className={styles.form}>
           {isAdm ? (
              // ADMIN LOGIN (Email/Pass Only)
              <form onSubmit={handleAdminAuth}>
                 <Input label="Registry Email" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
                 <Input label="Registry Token" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
                 <button className={styles.submitBtn} disabled={loading}>
                    {loading ? 'Authenticating Authority...' : 'Gain High-Level Access'}
                 </button>
              </form>
           ) : (
              // MARKETPLACE LOGIN (Google Only)
              <>
                {isRegister && !isRoleLocked && (
                   <div style={{ marginBottom: '8px' }}>
                     <Input 
                       label="I want to join as" 
                       as="select" 
                       value={requestedRole}
                       onChange={e => setRequestedRole(e.target.value as any)}
                     >
                       <option value="buyer">Individual User</option>
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
                  <span>
                    {loading 
                      ? 'Orchestrating Identity...' 
                      : (isRegister ? `Register ${requestedRole === 'seller' ? 'Merchant' : 'User'} with Google` : `${requestedRole === 'seller' ? 'Merchant' : 'User'} Login with Google`)
                    }
                  </span>
                </button>
              </>
           )}

          {error && <div className={styles.error}>{error}</div>}
        </div>

        {!isAdm && (
           <footer className={styles.toggle}>
             {isRegister ? `Already an active ${requestedRole === 'seller' ? 'merchant' : 'user'}?` : `New ${requestedRole === 'seller' ? 'merchant' : 'user'}?`} 
             <span className={styles.toggleBtn} onClick={() => setIsRegister(!isRegister)}>
               {isRegister ? ' Sign In' : ' Create Identity'}
             </span>
           </footer>
        )}
      </div>

      {showConfirmation && (
          <div className={styles.modalOverlay}>
             <div className={styles.modalContent}>
                <h2>Convert to Merchant</h2>
                <p>You are already registered as a buyer. Would you like to transition your account to a seller profile? This process will migrate your basic info and update your platform role.</p>
                <div className={styles.modalActions}>
                   <button className="button-base button-outline" onClick={() => { setShowConfirmation(false); setLoading(false); }}>Cancel</button>
                   <button className="button-base button-primary" onClick={handleConfirmConversion}>Convert & Continue</button>
                </div>
             </div>
          </div>
       )}
    </div>
  );
};

export default Login;
