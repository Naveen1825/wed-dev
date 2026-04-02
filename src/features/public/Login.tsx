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
    <div className={styles.page}>
      <div className={styles.splitLayout}>
        {/* 1. Brand Identity Hero Pane */}
        <section className={styles.heroPane}>
          <img 
            src="/pet_marketplace_onboarding_hero_1775159357209.png" 
            alt="AniSell Community" 
            className={styles.heroImage} 
          />
          <div className={styles.heroOverlay} />
        </section>

        {/* 2. Focused Authentication Hub */}
        <main className={styles.formPane}>
          <div className={styles.authCard}>
            <header className={styles.header}>
              <div className={styles.brand}>
                <img 
                  src="https://anisell.in/wp-content/uploads/2025/06/91-93450-29589-1.png" 
                  alt="AniSell" 
                  style={{ height: '40px', objectFit: 'contain' }} 
                />
              </div>
              <h1 className={styles.title}>
                {isAdm ? 'System Governance' : (requestedRole === 'seller' ? 'Merchant Portal' : 'Marketplace Hub')}
              </h1>
              <p className={styles.subtitle}>
                 {isAdm ? 'Authorize administrative session to access system controls.' : (isRegister ? `Become a verified ${requestedRole} and join our elite pet community.` : `Access your personalized ${requestedRole === 'seller' ? 'merchant' : 'user'} dashboard.`)}
              </p>
            </header>

            <div className={styles.form}>
               {isAdm ? (
                  // HIGH-LEVEL ADMINISTRATIVE ENTRY
                  <form onSubmit={handleAdminAuth} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                     <Input label="Registry Email" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
                     <Input label="Registry Token" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
                     <button className={styles.submitBtn} disabled={loading}>
                        {loading ? 'Authenticating Authority...' : 'Gain High-Level Access'}
                     </button>
                  </form>
               ) : (
                  // PUBLIC MARKETPLACE ONBOARDING
                  <>
                    {isRegister && !isRoleLocked && (
                       <div style={{ marginBottom: '8px' }}>
                         <Input 
                           label="Identify As" 
                           as="select" 
                           value={requestedRole}
                           onChange={e => setRequestedRole(e.target.value as any)}
                         >
                           <option value="buyer">Pet Parent (Buyer)</option>
                           <option value="seller">Verified Merchant (Seller)</option>
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
                          ? 'Synchronizing Identity...' 
                          : (isRegister ? `Join with Google` : `Sign in with Google`)
                        }
                      </span>
                    </button>
                  </>
               )}

              {error && <div className={styles.error}>{error}</div>}
            </div>

            {!isAdm && (
               <footer className={styles.toggle}>
                 {isRegister ? `Already part of the community?` : `New to AniSell?`} 
                 <span className={styles.toggleBtn} onClick={() => setIsRegister(!isRegister)}>
                   {isRegister ? 'Enter Registry' : 'Create Identity'}
                 </span>
               </footer>
            )}
          </div>
        </main>
      </div>

      {showConfirmation && (
          <div className={styles.modalOverlay}>
             <div className={styles.modalContent}>
                <h2>Merchant Conversion</h2>
                <p>Our records indicate you are currently a Pet Parent. Would you like to upgrade to a **Verified Merchant** profile? This will unlock store management and payout registries.</p>
                <div className={styles.modalActions}>
                   <button className="button-base button-outline" onClick={() => { setShowConfirmation(false); setLoading(false); }}>Keep Personal</button>
                   <button className="button-base button-primary" style={{ background: '#2563eb', color: '#fff', border: 'none' }} onClick={handleConfirmConversion}>Upgrade Profile</button>
                </div>
             </div>
          </div>
       )}
    </div>
  );
};

export default Login;
