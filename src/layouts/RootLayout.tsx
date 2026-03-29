import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

/**
 * Platform Root Layout.
 * Orchestrates the primary public experience with a consistent Navbar and Footer.
 * Used for the Home page, Marketplace, and Product detail views.
 */
const RootLayout: React.FC = () => {
  return (
    <div className="platform-root-layout" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
       <Navbar />
       <main style={{ flex: 1 }}>
          <Outlet />
       </main>
       <Footer />
    </div>
  );
};

export default RootLayout;
