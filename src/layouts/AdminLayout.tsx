import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  FiGrid, FiUsers, FiShoppingBag, FiMessageSquare 
} from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import styles from './AdminLayout.module.css';

/**
 * Admin Workspace Layout.
 * Orchestrates the administrative oversight Experience with a consistent 
 * sidebar navigation and governance branding.
 */
const AdminLayout: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { path: '/admin', icon: <FiGrid />, label: 'Platform Metrics' },
    { path: '/admin/accounts', icon: <FiUsers />, label: 'Identity Control' },
    { path: '/admin/listings', icon: <FiShoppingBag />, label: 'Listing Oversight' },
    { path: '/admin/inquiries', icon: <FiMessageSquare />, label: 'Inquiry Hub' },
  ];

  return (
    <div className={styles.layout}>
      {/* 1. Governance Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.logo}>A</div>
          <div className={styles.brandText}>
            <span className={styles.brandTitle}>AniSell</span>
            <span className={styles.brandRole}>Governance Hub</span>
          </div>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`${styles.navItem} ${location.pathname === item.path ? styles.active : ''}`}
            >
              <span className={styles.icon}>{item.icon}</span>
              <span className={styles.label}>{item.label}</span>
            </Link>
          ))}
        </nav>

        <footer className={styles.sidebarFooter}>
           <div className={styles.adminProfile}>
             <img src={user?.photoURL || 'https://www.w3schools.com/howto/img_avatar.png'} alt="" className={styles.avatar} />
             <div className={styles.profileInfo}>
                <div className={styles.profileName}>{user?.displayName || 'Admin User'}</div>
                <div className={styles.profileRole}>Super Administrator</div>
             </div>
           </div>
        </footer>
      </aside>

      {/* 2. Main Workspace Outlet */}
      <main className={styles.main}>
        <header className={styles.topBar}>
           <div className={styles.searchBar}>
             <input type="text" placeholder="Search platform identities..." className={styles.searchInput} />
           </div>
        </header>
        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
