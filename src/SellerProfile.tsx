import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiUser, FiPackage, FiStar, FiShield, FiSettings, FiLogOut,
  FiChevronRight, FiMapPin, FiPlus, FiBarChart2, FiMenu, FiX
} from 'react-icons/fi';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { useSearchData } from './hooks/useSearchData';
import type { Seller, Product } from './hooks/useSearchData';
import './Profile.css';

// --- Sub-Components ---

/**
 * KPI Card for Store Analytics
 */
const StatCard: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="stat-card-v2">
    <span className="stat-label">{label}</span>
    <span className="stat-value">{value}</span>
  </div>
);

/**
 * Star Rating Display
 */
const StarRating: React.FC<{ rating: number; showText?: boolean }> = ({ rating, showText = true }) => (
  <div className="rating-row">
    <div className="stars-container">
      {[...Array(5)].map((_, i) => (
        <FiStar key={i} fill={i < Math.round(rating) ? "#ffc107" : "none"} />
      ))}
    </div>
    {showText && <span className="rating-text">{rating.toFixed(1)} Store Rating</span>}
  </div>
);

/**
 * Compact Listing Item for Analytics Section
 */
const TopListingItem: React.FC<{ product: Product }> = ({ product }) => {
  const oldCount = product.oldSalesCount || 0;
  const newCount = product.newSalesCount || 0;
  const spike = oldCount > 0 ? Math.round(((newCount - oldCount) / oldCount) * 100) : 0;

  return (
    <div className="listing-card-compact">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <img src={product.productMedia[0]} alt="" className="listing-img-sm" />
        <div>
          <h4 style={{ fontSize: '14px', marginBottom: '2px' }}>{product.productSubCategory}</h4>
          <span style={{ fontSize: '12px', color: '#888' }}>{product.productType}</span>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <span style={{ display: 'block', fontSize: '15px', fontWeight: 700 }}>{newCount} Sales</span>
        <span className="spike-badge">{spike > 0 ? `+${spike}%` : `${spike}%`} spike</span>
      </div>
    </div>
  );
};

// --- Main Component ---

const SellerProfile: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { sellers, products, loading } = useSearchData();
  const [activeTab, setActiveTab] = useState('products');
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [highlightedListingId, setHighlightedListingId] = useState<string | null>(null);

  // Derive active seller
  const seller: Seller = useMemo(() => {
    return sellers.find(s => s.sellerId === id) || sellers[0] || {
      sellerId: 'mock-sel',
      sellerName: 'Paws & Whiskers',
      sellerProfile: 'https://randomuser.me/api/portraits/men/1.jpg',
      sellerLocation: 'Mumbai, MH',
      rating: 4.8,
      productIds: [],
      analytics: {
        totalSales: 0, revenue: 0, storeViews: 0, conversion: 0, storeRating: 0, salesHistory: [0,0,0,0,0,0,0]
      }
    };
  }, [sellers, id]);

  const sellerProducts = useMemo(() => 
    products.filter(p => seller.productIds.includes(p.productId)), 
  [products, seller.productIds]);

  const sellerReviews = useMemo(() => 
    sellerProducts.flatMap(p => 
      p.productReviews.map(r => ({ ...r, productId: p.productId, productName: p.productSubCategory }))
    ), 
  [sellerProducts]);

  const handleReviewItemClick = (productId: string) => {
    setActiveTab('products');
    setHighlightedListingId(productId);
    
    // Clear highlight after 3 seconds
    setTimeout(() => {
      setHighlightedListingId(null);
    }, 3000);
  };

  // Optimization: Scroll to the highlighted item if it exists
  React.useEffect(() => {
    if (highlightedListingId) {
      // Tiny delay to ensure React has swapped tabs and rendered the list
      const timer = setTimeout(() => {
        const element = document.getElementById(`listing-${highlightedListingId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [highlightedListingId]);

  const menuItems = [
    { id: 'dashboard',    icon: <FiBarChart2 />, label: 'Store Analytics' },
    { id: 'products',     icon: <FiPackage />,   label: 'My Listings' },
    { id: 'reviews',      icon: <FiStar />,      label: 'Customer Reviews' },
    { id: 'addresses',    icon: <FiMapPin />,    label: 'Store Addresses' },
    { id: 'verification', icon: <FiShield />,    label: 'Store Verification' },
    { id: 'profile',      icon: <FiUser />,      label: 'Seller Details' },
    { id: 'settings',     icon: <FiSettings />,  label: 'Store Settings' },
  ];

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

  return (
    <div className="profile-page-v2">
      <Navbar />

      <main className="profile-dashboard">
        <div className="dashboard-container">
          
          {/* Sidebar */}
          <div className={`dashboard-nav-overlay ${isNavOpen ? 'active' : ''}`} onClick={() => setIsNavOpen(false)} />
          <aside className={`dashboard-sidebar ${isNavOpen ? 'open' : ''}`}>
             <div className="sidebar-header-mobile">
              <h3>Seller Menu</h3>
              <button className="close-nav-btn" onClick={() => setIsNavOpen(false)}><FiX /></button>
            </div>
            <nav className="dashboard-nav">
              {menuItems.map(item => (
                <button 
                  key={item.id}
                  className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => { setActiveTab(item.id); setIsNavOpen(false); }}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                  <FiChevronRight className="chevron" />
                </button>
              ))}
              <div className="nav-divider"></div>
              <button className="nav-item logout">
                <span className="nav-icon"><FiLogOut /></span>
                <span className="nav-label">Logout Store</span>
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <div className="dashboard-content">
            <button className="mobile-nav-toggle" onClick={() => setIsNavOpen(true)}>
              <FiMenu /> <span>Seller Menu</span>
            </button>

            {/* Header */}
            <div className="user-profile-header">
              <div className="up-avatar-wrapper">
                <img src={seller.sellerProfile} alt={seller.sellerName} />
                <button className="up-edit-overlay"><FiUser /></button>
              </div>
              <div className="up-details">
                <h1 className="up-name">{seller.sellerName}</h1>
                <StarRating rating={seller.analytics?.storeRating || 0} />
                <p className="up-email">{seller.sellerLocation} • Certified Seller</p>
              </div>
              <button className="btn-edit-header" onClick={() => navigate('/result')}>View Public Store</button>
            </div>

            {/* Render Tabs */}
            {activeTab === 'products' && (
              <section className="content-section">
                <div className="section-header flex-between">
                  <div>
                    <h2>My Listings</h2>
                    <p>Manage your active pets and products</p>
                  </div>
                  <button className="btn-primary-blue"><FiPlus /> Add New Listing</button>
                </div>

                <div className="orders-list">
                  {sellerProducts.length > 0 ? (
                    sellerProducts.map(product => (
                      <div 
                        key={product.productId} 
                        id={`listing-${product.productId}`}
                        className={`order-card ${highlightedListingId === product.productId ? 'highlight-glow' : ''}`}
                      >
                        <div className="order-header flex-between">
                           <span className="status-badge delivered">Active</span>
                           <span className="order-id">Stock: In Stock</span>
                        </div>
                        <div className="order-body">
                          <img src={product.productMedia[0]} alt="" className="order-product-img" />
                          <div className="order-product-info">
                            <h4>{product.productSubCategory}</h4>
                            <p>{product.productType} • {product.productAge}</p>
                            <span className="order-price">₹{product.productPrice.toLocaleString()}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn-reorder" style={{ borderColor: '#e0e0e0', color: '#666' }}>Edit</button>
                            <button className="btn-reorder">Bump Listing</button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-wishlist">
                        <FiPackage className="big-icon" />
                        <p>No products listed yet.</p>
                        <button className="btn-continue">Create First Listing</button>
                    </div>
                  )}
                </div>
              </section>
            )}

            {activeTab === 'dashboard' && (
              <section className="content-section">
                <div className="section-header">
                  <h2>Store Analytics</h2>
                  <p>Performance overview based on your store data</p>
                </div>
                
                <div className="dashboard-stats-grid">
                  <StatCard label="Total Sales" value={seller.analytics?.totalSales || 0} />
                  <StatCard label="Store Views" value={(seller.analytics?.storeViews || 0).toLocaleString()} />
                  <StatCard label="Revenue" value={`₹${(seller.analytics?.revenue || 0).toLocaleString()}`} />
                  <StatCard label="Conversion" value={`${seller.analytics?.conversion || 0}%`} />
                </div>

                <h3>Monthly Sales Trend</h3>
                <div className="analytics-chart-container">
                  {(seller.analytics?.salesHistory || [0,0,0,0,0,0,0]).map((salesVal, i) => (
                    <div key={i} className="chart-bar-group">
                      <div 
                        className={`chart-bar ${i === 6 ? 'active' : ''}`} 
                        style={{ height: `${Math.min(salesVal * 1.5, 230)}px` }} 
                      />
                      <span className="chart-label">Day {i+1}</span>
                    </div>
                  ))}
                  <div className="chart-grid-line" style={{ bottom: '20px' }} />
                  <div className="chart-grid-line" style={{ bottom: '120px' }} />
                  <div className="chart-grid-line" style={{ bottom: '220px' }} />
                </div>

                <div className="section-header" style={{ marginTop: '40px' }}>
                  <h3>Top Performing Pets</h3>
                </div>
                <div className="orders-list">
                  {(() => {
                    const productsWithSales = sellerProducts
                      .filter(p => p.newSalesCount !== undefined && p.newSalesCount > 0)
                      .sort((a, b) => (b.newSalesCount || 0) - (a.newSalesCount || 0));

                    if (sellerProducts.length === 0) 
                      return <p className="empty-msg">No products listed under this account.</p>;

                    if (productsWithSales.length === 0 || sellerProducts.reduce((sum, p) => sum + (p.newSalesCount || 0), 0) === 0)
                      return <p className="empty-msg">No sales performance data available for active listings.</p>;

                    return productsWithSales.slice(0, 3).map(p => <TopListingItem key={p.productId} product={p} />);
                  })()}
                </div>
              </section>
            )}

            {activeTab === 'reviews' && (
              <section className="content-section">
                <div className="section-header">
                  <h2>Customer Reviews</h2>
                  <p>Feedback from buyers on your pet listings</p>
                </div>

                <div className="orders-list">
                  {sellerReviews.length > 0 ? (
                    sellerReviews.map((review, idx) => (
                      <div key={idx} className="order-card">
                        <div className="order-header flex-between">
                          <StarRating rating={review.rating} showText={false} />
                          <span className="order-date">{review.datetime}</span>
                        </div>
                        <div style={{ marginTop: '12px' }}>
                          <p style={{ fontSize: '15px', lineHeight: 1.6, marginBottom: '12px' }}>"{review.comment}"</p>
                          <div className="review-meta" onClick={() => handleReviewItemClick(review.productId)}>
                            <span style={{ fontSize: '12px', color: '#878787' }}>Reviewed Item:</span>
                            <span className="review-item-link">{review.productName}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-wishlist">
                      <FiStar className="big-icon" />
                      <p>No reviews received yet.</p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {activeTab === 'addresses' && (
              <section className="content-section">
                <div className="section-header flex-between">
                  <div>
                    <h2>Store Addresses</h2>
                    <p>Manage your verified pickup and business locations</p>
                  </div>
                  <button className="btn-primary-blue"><FiPlus /> Add Pickup Point</button>
                </div>
                
                <div className="orders-list">
                  {(seller.addresses && seller.addresses.length > 0) ? (
                    seller.addresses.map((addr, idx) => (
                      <div key={idx} className="address-card">
                        <div className="address-type">{addr.type}</div>
                        <h3>{addr.name}</h3>
                        <p>
                          {addr.addressLine}, {addr.locality}<br />
                          {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                        <p style={{ fontWeight: 600 }}>Phone: {addr.phone}</p>
                        <div className="address-actions">
                          <button style={{ color: '#2874f0', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600 }}>Edit</button>
                          <button style={{ color: '#ff4d4d', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600 }}>Remove</button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-msg">
                       <p>No verified addresses on file. Add a pickup location to start shipping!</p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {activeTab === 'profile' && (
              <section className="content-section">
                <div className="section-header">
                  <h2>Seller Details</h2>
                  <p>Individual or Business information</p>
                </div>
                <div className="profile-form-grid">
                  <div className="form-group"><label>Store Name</label><input type="text" defaultValue={seller.sellerName} /></div>
                  <div className="form-group"><label>Location</label><input type="text" defaultValue={seller.sellerLocation} /></div>
                  <div className="form-group"><label>Owner Birthday</label><input type="date" defaultValue={seller.dateOfBirth} /></div>
                  <div className="form-group">
                    <label>Owner Gender</label>
                    <select defaultValue={seller.Gender}>
                      <option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <button className="btn-save-changes">Save Store Details</button>
              </section>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SellerProfile;
