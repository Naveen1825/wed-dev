import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiUser, FiPackage, FiMapPin, FiHeart, FiSettings, FiLogOut, 
  FiChevronRight, FiCreditCard, FiShield, FiEdit2, FiMenu, FiX 
} from 'react-icons/fi';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { useSearchData } from './hooks/useSearchData';
import type { User } from './hooks/useSearchData';
import './Profile.css';

// --- Sub-Components ---

/**
 * Order Card Component for Orders List
 */
const OrderItem: React.FC<{ id: number }> = ({ id }) => (
  <div className="order-card">
    <div className="order-header flex-between">
      <div className="order-status-row">
        <span className="status-badge delivered">Delivered</span>
        <span className="order-date">On Jun 12, 2025</span>
      </div>
      <span className="order-id">ID: #ANS-9382{id}</span>
    </div>
    <div className="order-body">
      <img 
        src={id === 1 ? "https://images.unsplash.com/photo-1543466835-00a7907e9de1" : "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba"} 
        alt="" 
        className="order-product-img"
      />
      <div className="order-product-info">
        <h4>{id === 1 ? "Golden Retriever" : "Persian Cat"}</h4>
        <p>Vaccinated • 8 Weeks Old</p>
        <span className="order-price">₹25,000</span>
      </div>
      <button className="btn-reorder">Reorder</button>
    </div>
  </div>
);

// --- Main Component ---

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { users, loading } = useSearchData();
  const [activeTab, setActiveTab] = useState('profile');
  const [isNavOpen, setIsNavOpen] = useState(false);
  
  // Memoized user derivation
  const user: User = useMemo(() => {
    return users[3] || {
      UserId: 'mock-123',
      UserName: 'Naveen Kumar',
      UserEmail: 'naveen@example.com',
      UserNumber: '+91 93450 29589',
      sellerProfile: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
      dateOfBirth: '1992-04-12',
      Gender: 'Male'
    };
  }, [users]);

  const menuItems = [
    { id: 'profile', icon: <FiUser />, label: 'My Profile' },
    { id: 'orders', icon: <FiPackage />, label: 'My Orders' },
    { id: 'addresses', icon: <FiMapPin />, label: 'Addresses' },
    { id: 'favorites', icon: <FiHeart />, label: 'Wishlist' },
    { id: 'payments', icon: <FiCreditCard />, label: 'Saved Cards' },
    { id: 'security', icon: <FiShield />, label: 'Security' },
    { id: 'settings', icon: <FiSettings />, label: 'Settings' },
  ];

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

  return (
    <div className="profile-page-v2">
      <Navbar />

      <main className="profile-dashboard">
        <div className="dashboard-container">
          
          <div className={`dashboard-nav-overlay ${isNavOpen ? 'active' : ''}`} onClick={() => setIsNavOpen(false)} />
          
          <aside className={`dashboard-sidebar ${isNavOpen ? 'open' : ''}`}>
            <div className="sidebar-header-mobile">
              <h3>Account Menu</h3>
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
                <span className="nav-label">Logout</span>
              </button>
            </nav>
          </aside>

          <div className="dashboard-content">
            <button className="mobile-nav-toggle" onClick={() => setIsNavOpen(true)}>
              <FiMenu /> <span>Menu</span>
            </button>

            <div className="user-profile-header">
              <div className="up-avatar-wrapper">
                <img src={user.sellerProfile} alt={user.UserName} />
                <button className="up-edit-overlay"><FiEdit2 /></button>
              </div>
              <div className="up-details">
                <h1 className="up-name">{user.UserName}</h1>
                <p className="up-email">{user.UserEmail}</p>
              </div>
              <button className="btn-edit-header">Edit Profile</button>
            </div>

            {activeTab === 'orders' && (
              <section className="content-section">
                <div className="section-header">
                  <h2>My Orders</h2>
                  <p>View and track your previous orders</p>
                </div>
                <div className="orders-list">
                  {[1, 2].map(id => <OrderItem key={id} id={id} />)}
                </div>
              </section>
            )}

            {activeTab === 'profile' && (
              <section className="content-section profile-edit">
                <div className="section-header">
                  <h2>Profile Details</h2>
                  <p>Update your personal information</p>
                </div>
                <div className="profile-form-grid">
                  <div className="form-group"><label>Full Name</label><input type="text" defaultValue={user.UserName} /></div>
                  <div className="form-group"><label>Email Address</label><input type="email" defaultValue={user.UserEmail} /></div>
                  <div className="form-group"><label>Mobile Number</label><input type="text" defaultValue={user.UserNumber} /></div>
                  <div className="form-group"><label>Date of Birth</label><input type="date" defaultValue={user.dateOfBirth} /></div>
                  <div className="form-group">
                    <label>Gender</label>
                    <select defaultValue={user.Gender}>
                      <option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <button className="btn-save-changes">Save Profile</button>
              </section>
            )}

            {activeTab === 'addresses' && (
                <section className="content-section addresses">
                   <div className="section-header flex-between">
                    <div>
                      <h2>Manage Addresses</h2>
                      <p>Add or edit your saved delivery locations</p>
                    </div>
                    <button className="btn-add-address">+ Add New Address</button>
                  </div>
                  
                  <div className="orders-list">
                    {(user.addresses && user.addresses.length > 0) ? (
                      user.addresses.map((addr, idx) => (
                        <div key={idx} className="address-card">
                          <div className="address-type">{addr.type}</div>
                          <h3>{addr.name}</h3>
                          <p>
                            {addr.addressLine}, {addr.locality}<br />
                            {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                          <p style={{ fontWeight: 600 }}>Phone: {addr.phone}</p>
                          <div className="address-actions">
                            <button className="btn-edit-address">Edit</button>
                            <button className="btn-remove-address" style={{ color: '#ff4d4d' }}>Remove</button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="empty-wishlist">
                         <FiMapPin className="big-icon" />
                         <p>No addresses saved yet.</p>
                      </div>
                    )}
                  </div>
                </section>
            )}

            {activeTab === 'favorites' && (
              <section className="content-section wishlist">
                 <div className="section-header">
                    <h2>My Wishlist</h2>
                    <p>Items you have saved for later</p>
                  </div>
                  <div className="empty-wishlist">
                    <FiHeart className="big-icon" />
                    <p>Your wishlist is empty</p>
                    <button className="btn-continue" onClick={() => navigate('/result')}>Start Shopping</button>
                  </div>
              </section>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
