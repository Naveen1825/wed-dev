import React, { Suspense } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
const Home = React.lazy(() => import('./pages/Home'));
const SearchResults = React.lazy(() => import('./pages/SearchResults'));
const ProductDetail = React.lazy(() => import('./pages/ProductDetail'));
const Profile = React.lazy(() => import('./pages/Profile'));
const SellerProfile = React.lazy(() => import('./pages/SellerProfile'));
const Admin = React.lazy(() => import('./pages/Admin'));
const Login = React.lazy(() => import('./pages/Login'));
const Checkout = React.lazy(() => import('./pages/Checkout'));
const OrderDetail = React.lazy(() => import('./pages/OrderDetail'));
const SellerRegister = React.lazy(() => import('./pages/SellerRegister'));
import './App.css';

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <Suspense fallback={<div style={{height: "100vh", display: "flex", justifyContent: "center", alignItems: "center"}}><div className="spinner"></div></div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/result" element={<SearchResults />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/order/:id" element={<OrderDetail />} />
            <Route path="/checkout/:id" element={<Checkout />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/seller-profile" element={<SellerProfile />} />
            <Route path="/seller-profile/:id" element={<SellerProfile />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/login" element={<Login />} />
            <Route path="/seller-register" element={<SellerRegister />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
