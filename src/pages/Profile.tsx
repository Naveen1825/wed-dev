import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiUser, FiPackage, FiMapPin, FiHeart, FiSettings, FiLogOut, 
  FiChevronRight, FiCreditCard, FiShield, FiEdit2, FiMenu, FiX
} from 'react-icons/fi';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useSearchData } from '../hooks/useSearchData';
import { uploadToCloudinary } from '../services/cloudinary';
import { auth, db } from '../services/firebase';
import { updateProfile } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import type { Order as OrderType, Product as ProductType, Address as AddressType } from '../hooks/useSearchData';
import './Profile.css';

// --- Types & Constants ---

/**
 * Navigation menu configuration for the profile dashboard.
 */
const MENU_ITEMS = [
  { id: 'profile', icon: <FiUser />, label: 'My Profile' },
  { id: 'orders', icon: <FiPackage />, label: 'My Orders' },
  { id: 'addresses', icon: <FiMapPin />, label: 'Addresses' },
  { id: 'favorites', icon: <FiHeart />, label: 'Wishlist' },
  { id: 'payments', icon: <FiCreditCard />, label: 'Saved Cards' },
  { id: 'security', icon: <FiShield />, label: 'Security' },
  { id: 'settings', icon: <FiSettings />, label: 'Settings' },
];

// --- Sub-Components ---

/**
 * Reusable layout for profile dashboard sections.
 * Consolidates the repetitive header and container structure.
 */
const ProfileSection: React.FC<{
  id: string;
  title: string;
  subtitle: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, subtitle, action, children }) => (
  <section className="content-section">
    <div className="section-header flex-between">
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      {action}
    </div>
    {children}
  </section>
);

/**
 * Individual Address Card component.
 */
const AddressCard: React.FC<{ addr: AddressType }> = ({ addr }) => (
  <div className="address-card">
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
);

/**
 * Order Card Component for Orders List
 */
const OrderItem: React.FC<{ order: OrderType, product?: ProductType }> = ({ order, product }) => {
  const navigate = useNavigate();
  const isDelivered = order.status === 'DELIVERED';  const isCancelled = order.status === 'CANCELLED';
  
  // Define timeline steps
  const steps = isCancelled 
    ? ['PROCESSING', 'CANCELLED'] 
    : ['PROCESSING', 'SHIPPED', 'OUT FOR DELIVERY', 'DELIVERED'];
    
  // Map our basic mocked statuses to the steps array
  let currentStep = 0;
  if (order.status === 'SHIPPED') currentStep = 1;
  if (order.status === 'OUT FOR DELIVERY') currentStep = 2;
  if (isDelivered || isCancelled) currentStep = steps.length - 1;

  return (
    <div className="order-card">
      <div className="order-header flex-between">
        <span className="order-date">Ordered On {new Date(order.orderDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        <span className="order-id">ID: #{order.orderId}</span>
      </div>

      <div className="order-timeline">
        {steps.map((step, idx) => (
           <React.Fragment key={idx}>
             <div className={`timeline-step ${idx <= currentStep ? (isCancelled && idx === currentStep ? 'cancelled-active' : 'active') : ''}`}>
               <div className="timeline-dot"></div>
               <span className="timeline-label">{step}</span>
             </div>
             {idx < steps.length - 1 && (
               <div className={`timeline-connector ${idx < currentStep ? 'active-line' : ''}`}></div>
             )}
           </React.Fragment>
        ))}
      </div>

      <div className="order-body">
        <img 
          src={product?.productMedia[0] || "https://images.unsplash.com/photo-1543466835-00a7907e9de1"} 
          alt="" 
          className="order-product-img"
        />
        <div className="order-product-info">
          <h4>{product?.productSubCategory || "Unknown Product"}</h4>
          <p>{product?.productType || "Pet"} • {product?.productAge || "Unknown"}</p>
          <span className="order-price">₹{order.amount.toLocaleString('en-IN')}</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
          <button className="btn-reorder" onClick={() => navigate(`/order/${order.orderId}`)}>
            Track Order
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { products, loading: dataLoading } = useSearchData();
  const [activeTab, setActiveTab] = useState('orders');
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Fetch Firestore Profile
  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const currentUser = auth?.currentUser;
        if (currentUser && db) {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data());
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setProfileLoading(false);
      }
    };

    const unsubscribe = auth?.onAuthStateChanged(() => {
      fetchProfile();
    });

    return () => unsubscribe?.();
  }, []);

  /**
   * Triggers the hidden file input for avatar selection.
   */
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * Handles profile picture upload to Cloudinary and syncs it with Firestore and Firebase Auth.
   */
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      // 1. Upload to Cloudinary storage
      const secureUrl = await uploadToCloudinary(file);
      
      const currentUser = auth?.currentUser;
      if (currentUser && db) {
        const userRef = doc(db, 'users', currentUser.uid);
        
        // 2. Update Firestore document AND Auth profile for real-time consistency
        await Promise.all([
           updateDoc(userRef, { photoURL: secureUrl }),
           updateProfile(currentUser, { photoURL: secureUrl })
        ]);
        
        // 3. Update local state for immediate feedback
        setUserProfile((prev: any) => ({ ...prev, photoURL: secureUrl }));
        console.log('Profile and Auth picture updated successfully!');
      }
    } catch (error: any) {
      console.error('Failed to update avatar:', error);
      alert(`Could not update avatar: ${error.message || 'Please try again.'}`);
    } finally {
      setUploading(false);
      if (event.target) event.target.value = ''; // Reset input
    }
  };

  /**
   * Signs the user out and redirects to the home page.
   */
  const handleLogout = async () => {
    try {
      if (auth) {
        await auth.signOut();
        navigate('/');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  /**
   * Derives a unified user object from the Firestore profile,
   * falling back to currentUser auth data or mock data as needed.
   * This ensures the UI remains consistent regardless of data source.
   */
  const user = useMemo(() => {
    const currentUser = auth?.currentUser;
    const base = {
      uid: userProfile?.uid || currentUser?.uid || '',
      displayName: userProfile?.displayName || userProfile?.UserName || currentUser?.displayName || 'User',
      email: userProfile?.email || userProfile?.UserEmail || currentUser?.email || '',
      phone: userProfile?.phone || userProfile?.UserNumber || '',
      photoURL: userProfile?.photoURL || userProfile?.sellerProfile || currentUser?.photoURL || 'https://www.w3schools.com/howto/img_avatar.png',
      dateOfBirth: userProfile?.dateOfBirth || userProfile?.dob || '',
      gender: userProfile?.gender || userProfile?.Gender || '',
      addresses: userProfile?.addresses || [],
      orders: userProfile?.orders || []
    };
    return base;
  }, [userProfile]);


  if (dataLoading || profileLoading) return <div className="loading-container"><div className="spinner"></div></div>;

  return (
    <div className="profile-page-v2">
      <Navbar />

      <main className="profile-dashboard">
        <div className="dashboard-container">
          {/* File Input for Cloudinary upload */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
            accept="image/*"
          />
          
          <div className={`dashboard-nav-overlay ${isNavOpen ? 'active' : ''}`} onClick={() => setIsNavOpen(false)} />
          
          <aside className={`dashboard-sidebar ${isNavOpen ? 'open' : ''}`}>
            <div className="sidebar-header-mobile">
              <h3>Account Menu</h3>
              <button className="close-nav-btn" onClick={() => setIsNavOpen(false)}><FiX /></button>
            </div>
            <nav className="dashboard-nav">
              {MENU_ITEMS.map(item => (
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
              <button className="nav-item logout" onClick={handleLogout}>
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
                {uploading && <div className="avatar-loading-overlay"><div className="spinner mini"></div></div>}
                <img src={user.photoURL} alt={user.displayName} style={{ opacity: uploading ? 0.3 : 1 }} />
                <button className="up-edit-overlay" onClick={handleAvatarClick} disabled={uploading}>
                  <FiEdit2 />
                </button>
              </div>
              <div className="up-details">
                <h1 className="up-name">{user.displayName}</h1>
                <p className="up-email">{user.email}</p>
              </div>
            </div>

            {activeTab === 'orders' && (
              <ProfileSection 
                id="orders" 
                title="My Orders" 
                subtitle="View and track your previous orders"
              >
                <div className="orders-list">
                  {user.orders && user.orders.length > 0 ? (
                    user.orders.map((order: OrderType) => (
                      <OrderItem 
                        key={order.orderId} 
                        order={order} 
                        product={products.find(p => p.productId === order.productId)} 
                      />
                    ))
                  ) : (
                    <div className="empty-wishlist">
                      <FiPackage className="big-icon" />
                      <p>You haven't placed any orders yet.</p>
                      <button className="btn-continue" style={{ marginTop: 15 }} onClick={() => navigate('/result')}>
                        Start Shopping
                      </button>
                    </div>
                  )}
                </div>
              </ProfileSection>
            )}

            {activeTab === 'profile' && (
              <ProfileSection 
                id="profile" 
                title="Profile Details" 
                subtitle="View and update your personal information"
                action={
                  !isEditing ? (
                    <button className="btn-edit-header" onClick={() => setIsEditing(true)}>Edit Profile</button>
                  ) : (
                    <button className="btn-cancel-edit" onClick={() => setIsEditing(false)}>Cancel</button>
                  )
                }
              >
                {isEditing ? (
                  /* Profile Edit Form */
                  <form 
                    className="profile-form-grid" 
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const updatedData = {
                        displayName: (formData.get('userName') as string).trim(),
                        phone: (formData.get('userNumber') as string).trim(),
                        dateOfBirth: formData.get('dob') as string,
                        gender: formData.get('gender') as string
                      };
                      
                      try {
                        setUploading(true);
                        if (!db) throw new Error("Database not initialized");
                        const currentUid = auth?.currentUser?.uid;
                        if (!currentUid) throw new Error("Authentication required");

                        const userRef = doc(db, 'users', currentUid);
                        await updateDoc(userRef, updatedData);
                        
                        setUserProfile((prev: any) => ({ ...prev, ...updatedData }));
                        setIsEditing(false);
                        alert("Profile updated successfully!");
                      } catch (error: any) {
                        console.error('Update failed:', error);
                        alert(`Failed to update profile: ${error.message}`);
                      } finally {
                        setUploading(false);
                      }
                    }}
                  >
                    <div className="form-group">
                      <label>Full Name</label>
                      <input name="userName" type="text" defaultValue={user.displayName} required />
                    </div>
                    <div className="form-group">
                      <label>Email Address</label>
                      <input name="userEmail" type="email" defaultValue={user.email} disabled />
                    </div>
                    <div className="form-group">
                      <label>Mobile Number</label>
                      <input name="userNumber" type="text" defaultValue={user.phone} placeholder="+91 XXXXX XXXXX" />
                    </div>
                    <div className="form-group">
                      <label>Date of Birth</label>
                      <input name="dob" type="date" defaultValue={user.dateOfBirth} />
                    </div>
                    <div className="form-group">
                      <label>Gender</label>
                      <select name="gender" defaultValue={user.gender}>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div style={{ gridColumn: '1 / -1', marginTop: '20px' }}>
                      <button type="submit" className="btn-save-changes" disabled={uploading}>
                        {uploading ? 'Saving...' : 'Save Profile'}
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Profile Read-only View */
                  <div className="profile-details-static">
                    {[
                      { label: 'Full Name', value: user.displayName },
                      { label: 'Email Address', value: user.email },
                      { label: 'Mobile Number', value: user.phone },
                      { label: 'Date of Birth', value: user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : '' },
                      { label: 'Gender', value: user.gender }
                    ].map((item, idx) => (
                      <div className="detail-item" key={idx}>
                        <label>{item.label}</label>
                        <p className={!item.value ? 'not-set-value' : ''}>{item.value || 'Not set'}</p>
                      </div>
                    ))}
                  </div>
                )}
              </ProfileSection>
            )}

            {activeTab === 'addresses' && (
              <ProfileSection 
                id="addresses" 
                title="Manage Addresses" 
                subtitle="Add or edit your saved delivery locations"
                action={<button className="btn-add-address">+ Add New Address</button>}
              >
                <div className="orders-list">
                  {(user.addresses && user.addresses.length > 0) ? (
                    user.addresses.map((addr: AddressType, idx: number) => (
                      <AddressCard key={idx} addr={addr} />
                    ))
                  ) : (
                    <div className="empty-wishlist">
                       <FiMapPin className="big-icon" />
                       <p>No addresses saved yet.</p>
                    </div>
                  )}
                </div>
              </ProfileSection>
            )}

            {activeTab === 'favorites' && (
              <ProfileSection 
                id="wishlist" 
                title="My Wishlist" 
                subtitle="Items you have saved for later"
              >
                <div className="empty-wishlist">
                  <FiHeart className="big-icon" />
                  <p>Your wishlist is empty</p>
                  <button className="btn-continue" onClick={() => navigate('/result')}>Start Shopping</button>
                </div>
              </ProfileSection>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
