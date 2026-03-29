import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [isRegister, setIsRegister] = useState(false);
  const [requestedRole, setRequestedRole] = useState<'buyer' | 'seller'>('buyer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { loginWithGoogle } = useAuth();

  const handleGoogleAuth = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle(requestedRole);
      const redirectPath = requestedRole === 'seller' ? ROUTES.SELLER_DASHBOARD : ROUTES.USER_PROFILE;
      navigate(redirectPath);
    } catch (err: any) {
      setError(err.message || 'Identity acquisition failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      
      {/* 1. High-Fidelity Google Entry Port */}
      <div className={styles.authCard}>
        <header className={styles.header}>
          <h1 className={styles.title}>{isRegister ? 'Join the Community' : 'Welcome Back'}</h1>
          <p className={styles.subtitle}>The premier marketplace for verified pet listings.</p>
        </header>

        <div className={styles.form}>
          {isRegister && (
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
    </div>
  );
};

export default Login;
