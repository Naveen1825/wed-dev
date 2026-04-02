import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

/**
 * Platform Root Layout.
 * Orchestrates the primary public experience with a consistent Navbar and Footer.
 * Conditionally suppresses navigation components for focused entry points like Login.
 */
const RootLayout: React.FC = () => {
  const location = useLocation();
  const showNav = location.pathname !== '/login';

  return (
    <div className="platform-root-layout" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
       {showNav && <Navbar />}
       <main style={{ flex: 1 }}>
          <Outlet />
       </main>
       {showNav && <Footer />}
    </div>
  );
};

export default RootLayout;
