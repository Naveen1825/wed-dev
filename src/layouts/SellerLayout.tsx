import React from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { 
  FiUser, FiPackage, FiStar, 
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
  const { logout, user, sellerData } = useAuth();

  const menuItems = [
    { id: 'dashboard',    icon: <FiBarChart2 />, label: 'Store Analytics', path: ROUTES.SELLER_DASHBOARD },
    { id: 'products',     icon: <FiPackage />,   label: 'My Listings',    path: ROUTES.SELLER_DASHBOARD + '/products' },
    { id: 'reviews',      icon: <FiStar />,      label: 'Customer Reviews', path: ROUTES.SELLER_DASHBOARD + '/reviews' },
    { id: 'profile',      icon: <FiUser />,      label: 'Store Profile',    path: ROUTES.SELLER_DASHBOARD + '/edit' },
    { id: 'settings',     icon: <FiSettings />,  label: 'Merchant Settings', path: ROUTES.SELLER_DASHBOARD + '/settings' },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className={styles.layout}>
      <Navbar />
      
      <main className={styles.main}>
        <div className={styles.container}>
          
          {/* 1. Portal Workspace Sidebar (Slide Bar for Mobile) */}
          <div 
            className={`${styles.sidebarOverlay} ${isMobileMenuOpen ? styles.overlayActive : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <aside className={`${styles.sidebarWrapper} ${isMobileMenuOpen ? styles.wrapperActive : ''}`}>
            <div className={styles.sidebar}>
               <div className={styles.profileSection}>
                  <img src={user?.photoURL || 'https://www.w3schools.com/howto/img_avatar.png'} alt="" className={styles.avatar} />
                  <div className={styles.profileInfo}>
                    <h4 className={styles.storeName}>{sellerData?.shopName || user?.displayName}</h4>
                    <span className={styles.storeBadge}>Verified Merchant</span>
                  </div>
               </div>
               
               <nav className={styles.nav}>
                  {menuItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => {
                        navigate(item.path);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`${styles.navItem} ${location.pathname === item.path ? styles.navItemActive : ''}`}
                    >
                      {item.icon} {item.label}
                    </button>
                  ))}
                  {user?.role === 'both' && (
                     <>
                        <div className={styles.navDivider} />
                        <button 
                           onClick={() => {
                              navigate(ROUTES.USER_PROFILE);
                              setIsMobileMenuOpen(false);
                           }}
                           className={styles.navItem}
                           style={{ color: '#2563eb', fontWeight: 700 }}
                        >
                           Customer Profile
                        </button>
                     </>
                  )}
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
             <Outlet context={{ toggleMenu: () => setIsMobileMenuOpen(true) }} />
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SellerLayout;
