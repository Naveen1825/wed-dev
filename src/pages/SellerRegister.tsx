import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiShield, FiTrendingUp, FiArrowRight, FiUserPlus, FiSettings, FiPackage, FiDollarSign } from 'react-icons/fi';
import Footer from '../components/layout/Footer';
import './SellerRegister.css';

const SellerRegister: React.FC = () => {
  const navigate = useNavigate();

  const handleStartRegistering = () => {
    // Redirect to login with role=seller
    navigate('/login?role=seller');
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <div className="seller-register-page">
        <div className="seller-hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
        </div>
        <div className="section-container hero-container">
          <div className="hero-text-side">
            <h1>Scale Your Pet Business to <span className="logo-accent">New Heights</span></h1>
            <p>Join India's most trusted marketplace. Reach thousands of verified pet lovers and manage your entire business with our world-class toolkit.</p>
            <div className="hero-buttons">
              <button className="primary-btn-large" onClick={handleStartRegistering}>
                Start Selling <FiArrowRight />
              </button>
              <button className="secondary-btn-large" onClick={() => document.getElementById('benefits')?.scrollIntoView({ behavior: 'smooth' })}>
                View Features
              </button>
            </div>  
          </div>

          <div className="hero-visual-side">
            <div className="mockup-frame float-animation">
              <img src="/seller_dashboard_preview.png" alt="Seller Dashboard" className="mockup-img" />
            </div>
          </div>
        </div>
      </div>

        <div id="benefits" className="benefits-modern-section">
          <div className="section-container">
            <div className="section-header">
              <span className="section-badge-light">Trusted by thousands</span>
              <h2>Why Sell on <span>AniSell?</span></h2>
              <p>We provide a world-class ecosystem designed to help pet businesses thrive.</p>
            </div>

            <div className="benefits-feature-stack">
              <div className="benefit-row">
                <div className="benefit-content">
                  <div className="benefit-num-label">01</div>
                  <h3>Reach More High-Intent Customers</h3>
                  <p>Get your listings in front of thousands of active pet seekers across the country. Our platform is optimized to connect the right pets with the right families.</p>
                  <ul className="benefit-bullets">
                    <li><FiCheckCircle /> Targeted Traffic</li>
                    <li><FiCheckCircle /> Higher Conversion Rates</li>
                  </ul>
                </div>
                <div className="benefit-visual">
                  <div className="visual-blob blob-blue">
                    <FiTrendingUp className="visual-icon" />
                  </div>
                </div>
              </div>

              <div className="benefit-row alternate">
                <div className="benefit-content">
                  <div className="benefit-num-label">02</div>
                  <h3>Platform Built on Trust & Security</h3>
                  <p>Build lasting trust with our strict verification system and secure escrow-like payment protections. We ensure every transaction is safe for both parties.</p>
                  <ul className="benefit-bullets">
                    <li><FiCheckCircle /> Verified Seller Badge</li>
                    <li><FiCheckCircle /> Secure Payments</li>
                  </ul>
                </div>
                <div className="benefit-visual">
                  <div className="visual-blob blob-green">
                    <FiShield className="visual-icon" />
                  </div>
                </div>
              </div>

              <div className="benefit-row">
                <div className="benefit-content">
                  <div className="benefit-num-label">03</div>
                  <h3>Powerful Management Dashboard</h3>
                  <p>Use our powerful, intuitive dashboard to manage your listings, answer inquiries, and track analytics. Everything you need in one place.</p>
                  <ul className="benefit-bullets">
                    <li><FiCheckCircle /> Real-time Analytics</li>
                    <li><FiCheckCircle /> Centralized Inquiries</li>
                  </ul>
                </div>
                <div className="benefit-visual">
                  <div className="visual-blob blob-purple">
                    <FiCheckCircle className="visual-icon" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="steps-section">
          <div className="section-container">
            <div className="section-header">
              <span className="section-badge">Simple Process</span>
              <h2>How It <span>Works</span></h2>
              <p>Launch your shop in minutes with our streamlined onboarding</p>
            </div>
            <div className="steps-grid">
              <div className="step-card">
                <div className="step-card-num">01</div>
                <div className="step-icon-container">
                  <FiUserPlus className="step-icon" />
                </div>
                <div className="step-card-content">
                  <h4>Register Account</h4>
                  <p>Quick sign-up using Google or email. We prioritize your security from the first click.</p>
                </div>
                <div className="step-connector"></div>
              </div>

              <div className="step-card">
                <div className="step-card-num">02</div>
                <div className="step-icon-container">
                  <FiSettings className="step-icon" />
                </div>
                <div className="step-card-content">
                  <h4>Setup Profile</h4>
                  <p>Add your store details, location, and certifications to build instant trust with buyers.</p>
                </div>
                <div className="step-connector"></div>
              </div>

              <div className="step-card">
                <div className="step-card-num">03</div>
                <div className="step-icon-container">
                  <FiPackage className="step-icon" />
                </div>
                <div className="step-card-content">
                  <h4>Upload Listings</h4>
                  <p>Post your pets and accessories with high-quality photos. Our AI helps optimize your titles.</p>
                </div>
                <div className="step-connector"></div>
              </div>

              <div className="step-card">
                <div className="step-card-num">04</div>
                <div className="step-icon-container">
                  <FiDollarSign className="step-icon" />
                </div>
                <div className="step-card-content">
                  <h4>Start Selling</h4>
                  <p>Connect with verified buyers, manage inquiries, and grow your revenue safely.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="cta-final-section">
          <div className="cta-background"></div>
          <div className="section-container">
            <div className="cta-content">
              <h2>Ready to scale your business?</h2>
              <p>Join the community of successful pet sellers today and take your business to the next level.</p>
              <button className="primary-btn-large pulse-animation" onClick={handleStartRegistering}>
                Sign Up as Seller Now <FiArrowRight />
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SellerRegister;
