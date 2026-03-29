import React from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { 
  FiUser, FiPackage, FiStar, FiShield, 
  FiSettings, FiLogOut, FiBarChart2 
} from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/constants/routes';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import styles from './SellerLayout.module.css';

/**
 * Standardized Merchant Dashboard Layout.
 * Orchestrates the seller experience through a dedicated sidebar and main workspace,
 * leveraging a scoped styling architectural layer for platform consistency.
 */
const SellerLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  const menuItems = [
    { id: 'dashboard',    icon: <FiBarChart2 />, label: 'Store Analytics', path: ROUTES.SELLER_DASHBOARD },
    { id: 'products',     icon: <FiPackage />,   label: 'My Listings',    path: '/seller/products' },
    { id: 'reviews',      icon: <FiStar />,      label: 'Customer Reviews', path: '/seller/reviews' },
    { id: 'verification', icon: <FiShield />,    label: 'Store Verification', path: '/seller/verification' },
    { id: 'profile',      icon: <FiUser />,      label: 'Store Profile',    path: '/seller/edit' },
    { id: 'settings',     icon: <FiSettings />,  label: 'Merchant Settings', path: '/seller/settings' },
  ];

  return (
    <div className={styles.layout}>
      <Navbar />
      
      <main className={styles.main}>
        <div className={styles.container}>
          
          {/* 1. Portal Workspace Sidebar */}
          <aside className={styles.sidebarWrapper}>
            <div className={styles.sidebar}>
               <div className={styles.profileSection}>
                  <img src={user?.photoURL || 'https://www.w3schools.com/howto/img_avatar.png'} alt="" className={styles.avatar} />
                  <div className={styles.profileInfo}>
                    <h4 className={styles.storeName}>{user?.displayName}</h4>
                    <span className={styles.storeBadge}>Verified Merchant</span>
                  </div>
               </div>
               
               <nav className={styles.nav}>
                  {menuItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => navigate(item.path)}
                      className={`${styles.navItem} ${location.pathname === item.path ? styles.navItemActive : ''}`}
                    >
                      {item.icon} {item.label}
                    </button>
                  ))}
                  <div className={styles.navDivider} />
                  <button 
                    onClick={async () => { await logout(); navigate(ROUTES.HOME); }}
                    className={`${styles.navItem} ${styles.logout}`}
                  >
                    <FiLogOut /> Logout Store
                  </button>
               </nav>
            </div>
          </aside>

          {/* 2. Feature Orchestration Outlet */}
          <section className={styles.content}>
             <Outlet />
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SellerLayout;
