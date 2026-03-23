import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FiGrid, FiPackage, FiUsers, FiMail, FiShield, FiLogOut,
  FiCheckCircle, FiXCircle, FiEye, FiTrendingUp, FiDollarSign,
  FiHome, FiBarChart2, FiActivity,
} from 'react-icons/fi';
import { MdStorefront } from 'react-icons/md';
import { useSearchData } from './hooks/useSearchData';
import './Admin.css';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Inquiry {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  productPrice: number;
  sellerName: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  message: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface PendingListing {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  productType: string;
  productPrice: number;
  sellerName: string;
  sellerId: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

type AdminTab = 'overview' | 'inquiries' | 'listings' | 'sellers' | 'users' | 'traffic';

// ─── Local Storage helpers ─────────────────────────────────────────────────
const LS_INQUIRIES = 'anisell_inquiries';
const LS_LISTINGS  = 'anisell_pending_listings';

export const getInquiries = (): Inquiry[] => {
  try { return JSON.parse(localStorage.getItem(LS_INQUIRIES) || '[]'); } catch { return []; }
};

export const saveInquiry = (inquiry: Inquiry) => {
  const arr = getInquiries();
  arr.unshift(inquiry);
  localStorage.setItem(LS_INQUIRIES, JSON.stringify(arr));
};

export const getPendingListings = (): PendingListing[] => {
  try { return JSON.parse(localStorage.getItem(LS_LISTINGS) || '[]'); } catch { return []; }
};

export const savePendingListing = (listing: PendingListing) => {
  const arr = getPendingListings();
  arr.unshift(listing);
  localStorage.setItem(LS_LISTINGS, JSON.stringify(arr));
};

// ─── Sub-components ────────────────────────────────────────────────────────────

const KpiCard: React.FC<{
  label: string; value: string | number; change: string;
  up?: boolean; neutral?: boolean; icon: React.ReactNode; color?: string;
}> = ({ label, value, change, up, neutral, icon, color }) => (
  <div className="admin-kpi-card" style={{ '--kpi-color': color } as React.CSSProperties}>
    <div className="admin-kpi-icon" style={color ? { background: `${color}18`, color } : {}}>
      {icon}
    </div>
    <div className="admin-kpi-label">{label}</div>
    <div className="admin-kpi-value">{value}</div>
    <div className={`admin-kpi-change ${neutral ? 'neutral' : up ? 'up' : 'down'}`}>
      {!neutral && (up ? '▲' : '▼')} {change}
    </div>
  </div>
);

const StatusPill: React.FC<{ status: string }> = ({ status }) => (
  <span className={`status-pill ${status}`}>
    {status.charAt(0).toUpperCase() + status.slice(1)}
  </span>
);

// ─── Inquiry Modal ─────────────────────────────────────────────────────────────
const InquiryModal: React.FC<{
  inquiry: Inquiry; onClose: () => void;
  onApprove: (id: string) => void; onReject: (id: string) => void;
}> = ({ inquiry, onClose, onApprove, onReject }) => (
  <div className="admin-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
    <div className="admin-modal">
      <div className="admin-modal-header">
        <span className="admin-modal-title">Buyer Inquiry Detail</span>
        <button className="admin-modal-close" onClick={onClose}>✕</button>
      </div>
      <div className="admin-modal-body">
        <div className="admin-modal-row">
          <img src={inquiry.productImage} alt="" className="admin-modal-product-img" />
          <div style={{ flex: 1 }}>
            <div className="admin-modal-field"><label>Product</label><p>{inquiry.productName}</p></div>
            <div className="admin-modal-field"><label>Listed Price</label><p>₹{inquiry.productPrice.toLocaleString('en-IN')}</p></div>
          </div>
        </div>
        <div className="admin-modal-field"><label>Buyer Name</label><p>{inquiry.buyerName}</p></div>
        <div className="admin-modal-field"><label>Email</label><p>{inquiry.buyerEmail}</p></div>
        <div className="admin-modal-field"><label>Phone</label><p>{inquiry.buyerPhone}</p></div>
        <div className="admin-modal-field"><label>Message</label><p style={{ whiteSpace: 'pre-wrap' }}>{inquiry.message}</p></div>
        <div className="admin-modal-field"><label>Seller</label><p>{inquiry.sellerName}</p></div>
        <div className="admin-modal-field"><label>Submitted</label><p>{inquiry.timestamp}</p></div>
        <StatusPill status={inquiry.status} />
      </div>
      <div className="admin-modal-footer">
        <button className="admin-btn admin-btn-ghost" onClick={onClose}>Close</button>
        {inquiry.status === 'pending' && <>
          <button className="admin-btn admin-btn-reject" onClick={() => { onReject(inquiry.id); onClose(); }}>
            <FiXCircle /> Reject
          </button>
          <button className="admin-btn admin-btn-approve" onClick={() => { onApprove(inquiry.id); onClose(); }}>
            <FiCheckCircle /> Forward to Seller
          </button>
        </>}
      </div>
    </div>
  </div>
);

// ─── Listing Modal ─────────────────────────────────────────────────────────────
const ListingModal: React.FC<{
  listing: PendingListing; onClose: () => void;
  onApprove: (id: string) => void; onReject: (id: string) => void;
}> = ({ listing, onClose, onApprove, onReject }) => (
  <div className="admin-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
    <div className="admin-modal">
      <div className="admin-modal-header">
        <span className="admin-modal-title">Listing Review</span>
        <button className="admin-modal-close" onClick={onClose}>✕</button>
      </div>
      <div className="admin-modal-body">
        <div className="admin-modal-row">
          <img src={listing.productImage} alt="" className="admin-modal-product-img" />
          <div style={{ flex: 1 }}>
            <div className="admin-modal-field"><label>Pet / Product</label><p>{listing.productName}</p></div>
            <div className="admin-modal-field"><label>Category</label><p>{listing.productType}</p></div>
          </div>
        </div>
        <div className="admin-modal-field"><label>Asking Price</label><p>₹{listing.productPrice.toLocaleString('en-IN')}</p></div>
        <div className="admin-modal-field"><label>Submitted By</label><p>{listing.sellerName}</p></div>
        <div className="admin-modal-field"><label>Submitted At</label><p>{listing.submittedAt}</p></div>
        {listing.notes && <div className="admin-modal-field"><label>Seller Notes</label><p>{listing.notes}</p></div>}
        <StatusPill status={listing.status} />
      </div>
      <div className="admin-modal-footer">
        <button className="admin-btn admin-btn-ghost" onClick={onClose}>Close</button>
        {listing.status === 'pending' && <>
          <button className="admin-btn admin-btn-reject" onClick={() => { onReject(listing.id); onClose(); }}>
            <FiXCircle /> Reject
          </button>
          <button className="admin-btn admin-btn-approve" onClick={() => { onApprove(listing.id); onClose(); }}>
            <FiCheckCircle /> Approve & Publish
          </button>
        </>}
      </div>
    </div>
  </div>
);

// ─── Main Admin Component ──────────────────────────────────────────────────────
const Admin: React.FC = () => {
  const navigate = useNavigate();
  const { sellers, products, users, loading } = useSearchData();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inquiries, setInquiries] = useState<Inquiry[]>(() => getInquiries());
  const [pendingListings, setPendingListings] = useState<PendingListing[]>(() => {
    const stored = getPendingListings();
    if (stored.length === 0 && products.length > 0) {
      const seed: PendingListing[] = products.slice(0, 6).map((p, i) => ({
        id: `lst_${i + 1}`,
        productId: p.productId,
        productName: p.productSubCategory,
        productImage: p.productMedia?.[0] || '',
        productType: p.productType,
        productPrice: p.productPrice,
        sellerName: p.sellerName || 'Unknown Seller',
        sellerId: `sel_00${i + 1}`,
        submittedAt: '2026-03-20 10:30',
        status: (i < 2 ? 'pending' : i < 4 ? 'approved' : 'rejected') as any,
      }));
      localStorage.setItem(LS_LISTINGS, JSON.stringify(seed));
      return seed;
    }
    return stored;
  });

  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [selectedListing, setSelectedListing] = useState<PendingListing | null>(null);
  const [listingFilter, setListingFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [inquiryFilter, setInquiryFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [toast, setToast] = useState<{ msg: string; type?: 'error' } | null>(null);

  const showToast = useCallback((msg: string, type?: 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const updateInquiries = (arr: Inquiry[]) => {
    setInquiries(arr);
    localStorage.setItem(LS_INQUIRIES, JSON.stringify(arr));
  };

  const updateListings = (arr: PendingListing[]) => {
    setPendingListings(arr);
    localStorage.setItem(LS_LISTINGS, JSON.stringify(arr));
  };

  const handleApproveInquiry = (id: string) => {
    updateInquiries(inquiries.map(i => i.id === id ? { ...i, status: 'approved' as const } : i));
    showToast('Inquiry approved & forwarded to seller!');
  };
  const handleRejectInquiry = (id: string) => {
    updateInquiries(inquiries.map(i => i.id === id ? { ...i, status: 'rejected' as const } : i));
    showToast('Inquiry rejected.', 'error');
  };
  const handleApproveListing = (id: string) => {
    updateListings(pendingListings.map(l => l.id === id ? { ...l, status: 'approved' as const } : l));
    showToast('Listing approved & published!');
  };
  const handleRejectListing = (id: string) => {
    updateListings(pendingListings.map(l => l.id === id ? { ...l, status: 'rejected' as const } : l));
    showToast('Listing rejected.', 'error');
  };

  // Enhanced traffic analytics
  const trafficAnalytics = useMemo(() => {
    const activeSellers = sellers.filter(s => s.analytics?.storeViews && s.analytics.storeViews > 0);
    const totalViews = activeSellers.reduce((sum, s) => sum + (s.analytics?.storeViews || 0), 0);
    const totalSales = activeSellers.reduce((sum, s) => sum + (s.analytics?.totalSales || 0), 0);
    const avgConversion = activeSellers.length > 0 
      ? activeSellers.reduce((sum, s) => sum + (s.analytics?.conversion || 0), 0) / activeSellers.length 
      : 0;
    const sellersWithRating = activeSellers.filter(s => s.analytics?.storeRating && s.analytics.storeRating > 0);
    const avgRating = sellersWithRating.length > 0
      ? sellersWithRating.reduce((sum, s) => sum + (s.analytics!.storeRating!), 0) / sellersWithRating.length
      : 0;

    // Calculate trend (last 7 days vs previous 7 days)
    const recentSales = activeSellers.reduce((sum, s) => {
      const history = s.analytics?.salesHistory || [];
      return sum + history.slice(-3).reduce((h, v) => h + v, 0); // Last 3 days
    }, 0);
    
    const previousSales = activeSellers.reduce((sum, s) => {
      const history = s.analytics?.salesHistory || [];
      return sum + history.slice(-6, -3).reduce((h, v) => h + v, 0); // Previous 3 days
    }, 0);

    const salesTrend = previousSales > 0 ? ((recentSales - previousSales) / previousSales * 100) : 0;

    return {
      totalViews,
      totalSales,
      avgConversion,
      avgRating,
      salesTrend,
      activeSellers: activeSellers.length
    };
  }, [sellers]);

  const trafficData = useMemo(() =>
    sellers
      .filter(s => s.analytics?.storeViews && s.analytics.storeViews > 0)
      .sort((a, b) => (b.analytics?.storeViews || 0) - (a.analytics?.storeViews || 0)),
  [sellers]);

  // Enhanced analytics derived from products.json
  const totalRevenue  = useMemo(() => sellers.reduce((s, sel) => s + (sel.analytics?.revenue    || 0), 0), [sellers]);
  const totalSales    = useMemo(() => sellers.reduce((s, sel) => s + (sel.analytics?.totalSales  || 0), 0), [sellers]);
  const totalViews    = trafficAnalytics.totalViews;
  const avgConversion = trafficAnalytics.avgConversion.toFixed(1);

  const totalReviews = useMemo(() =>
    products.reduce((s, p) => s + (p.productReviews?.length || 0), 0), [products]);

  // Category breakdown from products
  const categoryStats = useMemo(() => {
    const map: Record<string, number> = {};
    products.forEach(p => {
      map[p.productType] = (map[p.productType] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [products]);


  // Top products by sales
  const topProducts = useMemo(() =>
    [...products]
      .filter(p => (p.newSalesCount || 0) > 0)
      .sort((a, b) => (b.newSalesCount || 0) - (a.newSalesCount || 0))
      .slice(0, 5),
  [products]);

  const topSellers    = useMemo(() =>
    [...sellers].sort((a, b) => (b.analytics?.totalSales || 0) - (a.analytics?.totalSales || 0)).slice(0, 5),
  [sellers]);

  const pendingInquiryCount = inquiries.filter(i => i.status === 'pending').length;
  const pendingListingCount = pendingListings.filter(l => l.status === 'pending').length;

  const filteredListings = useMemo(() =>
    listingFilter === 'all' ? pendingListings : pendingListings.filter(l => l.status === listingFilter),
  [pendingListings, listingFilter]);

  const filteredInquiries = useMemo(() =>
    inquiryFilter === 'all' ? inquiries : inquiries.filter(i => i.status === inquiryFilter),
  [inquiries, inquiryFilter]);

  const navItems = [
    { id: 'overview',  icon: <FiGrid />,       label: 'Overview',          badge: null },
    { id: 'traffic',   icon: <FiBarChart2 />,  label: 'Site Traffic',      badge: null },
    { id: 'inquiries', icon: <FiMail />,        label: 'Inquiries',         badge: pendingInquiryCount || null },
    { id: 'listings',  icon: <FiPackage />,     label: 'Listing Approvals', badge: pendingListingCount || null },
    { id: 'sellers',   icon: <MdStorefront />,  label: 'Sellers',           badge: null },
    { id: 'users',     icon: <FiUsers />,       label: 'Users',             badge: null },
  ];

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;

  return (
    <>
      {/* Mobile-only message */}
      <div className="admin-mobile-notice">
        <div className="admin-mobile-notice-content">
          <div className="admin-mobile-icon">📱</div>
          <h2>Admin Dashboard</h2>
          <p>For the best experience, please open this admin panel on a tablet or laptop/desktop computer.</p>
          <p>The dashboard requires a larger screen for detailed analytics and management features.</p>
          <button 
            className="admin-btn admin-btn-primary"
            onClick={() => navigate('/')}
          >
            Go to Storefront
          </button>
        </div>
      </div>

      <div className="admin-layout">
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 99 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Real site logo */}
        <div className="admin-logo">
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flex: 1 }}>
            <img
              src="https://anisell.in/wp-content/uploads/2025/06/91-93450-29589-1.png"
              alt="AniSell"
              style={{ height: 38, objectFit: 'contain' }}
            />
          </Link>
          <span className="admin-logo-badge">ADMIN</span>
        </div>

        <nav className="admin-nav">
          <div className="admin-nav-group">
            <div className="admin-nav-label">Dashboard</div>
            {navItems.map(item => (
              <button
                key={item.id}
                className={`admin-nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => { setActiveTab(item.id as AdminTab); setSidebarOpen(false); }}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge ? <span className="nav-badge">{item.badge}</span> : null}
              </button>
            ))}
          </div>

          <div className="admin-nav-group">
            <div className="admin-nav-label">Quick Links</div>
            <button className="admin-nav-item" onClick={() => navigate('/')}>
              <FiHome /><span>Go to Storefront</span>
            </button>
            <button className="admin-nav-item" style={{ color: '#d32f2f' }}>
              <FiLogOut /><span>Logout</span>
            </button>
          </div>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-chip">
            <img src="/user-profile.png" alt="Admin"
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://randomuser.me/api/portraits/men/10.jpg'; }}
            />
            <div>
              <div className="admin-user-chip-name">Naveen Kumar</div>
              <div className="admin-user-chip-role">Super Admin</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="admin-main">
        <div className="admin-content">

          {/* ─── OVERVIEW ─────────────────────────────────────────── */}
          {activeTab === 'overview' && (
            <>
              {/* KPI Row */}
              <div className="admin-kpi-grid">
                <KpiCard label="Total Revenue" value={`₹${(totalRevenue / 100000).toFixed(1)}L`}
                  change={`${sellers.filter(s => s.analytics?.revenue).length} active sellers`}
                  up icon={<FiDollarSign />} color="#148860" />
                <KpiCard label="Total Sales" value={totalSales}
                  change={`${topProducts.length} trending products`}
                  up icon={<FiTrendingUp />} color="#2874f0" />
                <KpiCard label="Site Traffic" value={totalViews.toLocaleString('en-IN')}
                  change={`${avgConversion}% avg. conversion`}
                  up icon={<FiBarChart2 />} color="#e65100" />
                <KpiCard label="Open Inquiries" value={pendingInquiryCount}
                  change={`${inquiries.length} total received`}
                  neutral={pendingInquiryCount === 0}
                  up={pendingInquiryCount > 0}
                  icon={<FiMail />} color="#7b1fa2" />
              </div>

              {/* Second row */}
              <div className="admin-kpi-grid" style={{ marginBottom: 24 }}>
                <KpiCard label="Registered Sellers" value={sellers.length}
                  change={`${sellers.filter(s => s.productIds?.length).length} with listings`}
                  neutral icon={<MdStorefront />} color="#2874f0" />
                <KpiCard label="Registered Users" value={users.length}
                  change="verified buyers" neutral icon={<FiUsers />} color="#00897b" />
                <KpiCard label="Active Listings" value={products.length}
                  change={`${pendingListingCount} pending approval`}
                  neutral icon={<FiPackage />} color="#f57c00" />
                <KpiCard label="Total Reviews" value={totalReviews}
                  change="across all products" neutral icon={<FiActivity />} color="#c62828" />
              </div>

              {/* Top sellers + Platform breakdown */}
              <div className="admin-grid-2">
                {/* Top Sellers */}
                <div className="admin-panel">
                  <div className="admin-panel-header">
                    <span className="admin-panel-title"><MdStorefront /> Top Sellers by Sales</span>
                    <button className="admin-panel-action" onClick={() => setActiveTab('sellers')}>View All</button>
                  </div>
                  {topSellers.map((seller, idx) => (
                    <div key={seller.sellerId} className="seller-row">
                      <span style={{ fontSize: 12, fontWeight: 700, color: idx === 0 ? '#f57c00' : '#878787', width: 18 }}>
                        #{idx + 1}
                      </span>
                      <img src={seller.sellerProfile} alt="" className="seller-row-avatar" />
                      <div>
                        <div className="seller-row-name">{seller.sellerName}</div>
                        <div className="seller-row-loc">{seller.sellerLocation}</div>
                      </div>
                      <div className="seller-row-sales">
                        <strong>{seller.analytics?.totalSales ?? 0}</strong>
                        <span>Sales · ₹{((seller.analytics?.revenue || 0) / 1000).toFixed(0)}K</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Product Category Breakdown */}
                <div className="admin-panel">
                  <div className="admin-panel-header">
                    <span className="admin-panel-title"><FiPackage /> Product Categories</span>
                  </div>
                  {categoryStats.map(([cat, count]) => {
                    const pct = Math.round((count / products.length) * 100);
                    return (
                      <div key={cat} style={{ padding: '11px 20px', borderBottom: '1px solid #f5f5f5' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#212121' }}>{cat}</span>
                          <span style={{ fontSize: 12, color: '#878787' }}>{count} listings · {pct}%</span>
                        </div>
                        <div style={{ height: 5, background: '#f1f3f6', borderRadius: 10 }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: '#2874f0', borderRadius: 10, transition: 'width 0.6s ease' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top Products */}
              <div className="admin-panel-full">
                <div className="admin-panel-header">
                  <span className="admin-panel-title"><FiTrendingUp /> Top Performing Products</span>
                  <button className="admin-panel-action" onClick={() => setActiveTab('listings')}>Manage Listings</button>
                </div>
                <table className="admin-table">
                  <thead>
                    <tr><th>#</th><th>Product</th><th>Type</th><th>Price</th><th>Sales</th><th>Seller</th></tr>
                  </thead>
                  <tbody>
                    {topProducts.map((p, i) => (
                      <tr key={p.productId}>
                        <td style={{ color: i === 0 ? '#f57c00' : '#878787', fontWeight: 700 }}>#{i+1}</td>
                        <td>
                          <div className="tbl-product-cell">
                            <img src={p.productMedia?.[0]} alt="" className="tbl-product-img" />
                            <div>
                              <div className="tbl-product-name">{p.productSubCategory}</div>
                              <div className="tbl-product-sub">{p.productCategory}</div>
                            </div>
                          </div>
                        </td>
                        <td>{p.productType}</td>
                        <td>₹{p.productPrice.toLocaleString('en-IN')}</td>
                        <td style={{ fontWeight: 700, color: '#2874f0' }}>{p.newSalesCount}</td>
                        <td>{p.sellerName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ─── TRAFFIC ──────────────────────────────────────────── */}
          {activeTab === 'traffic' && (
            <>
              <div className="admin-kpi-grid">
                <KpiCard label="Total Store Views" value={trafficAnalytics.totalViews.toLocaleString('en-IN')}
                  change={`${trafficAnalytics.activeSellers} active sellers`} up icon={<FiBarChart2 />} color="#2874f0" />
                <KpiCard label="Avg. Conversion Rate" value={`${trafficAnalytics.avgConversion.toFixed(1)}%`}
                  change="views to sales" up={trafficAnalytics.avgConversion > 10} icon={<FiTrendingUp />} color="#148860" />
                <KpiCard label="Sales Trend" value={`${trafficAnalytics.salesTrend > 0 ? '+' : ''}${trafficAnalytics.salesTrend.toFixed(1)}%`}
                  change="last 3 days" up={trafficAnalytics.salesTrend > 0} neutral={trafficAnalytics.salesTrend === 0} icon={<FiActivity />} color="#e65100" />
                <KpiCard label="Avg. Store Rating" value={`${trafficAnalytics.avgRating.toFixed(1)} ★`}
                  change="platform quality" up={trafficAnalytics.avgRating > 4.0} icon={<FiShield />} color="#7b1fa2" />
              </div>

              {/* Enhanced Traffic Analytics */}
              <div className="admin-grid-2">
                {/* Top Performing Stores */}
                <div className="admin-panel">
                  <div className="admin-panel-header">
                    <span className="admin-panel-title"><FiBarChart2 /> Top Performing Stores</span>
                  </div>
                  <div style={{ padding: '20px' }}>
                    {trafficData.slice(0, 5).map((seller, idx) => {
                      const pct = Math.round(((seller.analytics?.storeViews || 0) / Math.max(trafficAnalytics.totalViews, 1)) * 100);
                      const revenue = (seller.analytics?.revenue || 0) / 1000;
                      return (
                        <div key={seller.sellerId} style={{ marginBottom: 16 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                            <span style={{ 
                              fontSize: 11, 
                              fontWeight: 700, 
                              color: idx === 0 ? '#f57c00' : '#878787', 
                              width: 20,
                              textAlign: 'center'
                            }}>
                              #{idx + 1}
                            </span>
                            <img src={seller.sellerProfile} alt="" style={{ 
                              width: 28, 
                              height: 28, 
                              borderRadius: '50%', 
                              objectFit: 'cover', 
                              border: '2px solid #e8f0fe' 
                            }} />
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 12, fontWeight: 700 }}>{seller.sellerName}</span>
                                <span style={{ fontSize: 11, color: '#2874f0', fontWeight: 700 }}>
                                  {pct}%
                                </span>
                              </div>
                              <div style={{ fontSize: 10, color: '#878787', marginTop: 2 }}>
                                {(seller.analytics?.storeViews || 0).toLocaleString('en-IN')} views · 
                                ₹{revenue.toFixed(0)}K revenue
                              </div>
                            </div>
                          </div>
                          <div style={{ height: 6, background: '#f1f3f6', borderRadius: 10 }}>
                            <div style={{ 
                              height: '100%', 
                              width: `${pct}%`, 
                              background: idx === 0 ? '#f57c00' : '#2874f0', 
                              borderRadius: 10,
                              transition: 'width 0.6s ease'
                            }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Traffic Insights */}
                <div className="admin-panel">
                  <div className="admin-panel-header">
                    <span className="admin-panel-title"><FiActivity /> Traffic Insights</span>
                  </div>
                  <div style={{ padding: '20px' }}>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#212121' }}>Active Stores</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#2874f0' }}>
                          {trafficAnalytics.activeSellers} / {sellers.length}
                        </span>
                      </div>
                      <div style={{ height: 6, background: '#f1f3f6', borderRadius: 10 }}>
                        <div style={{ 
                          height: '100%', 
                          width: `${(trafficAnalytics.activeSellers / sellers.length) * 100}%`, 
                          background: '#2874f0', 
                          borderRadius: 10 
                        }} />
                      </div>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 11, color: '#878787', marginBottom: 8 }}>Performance Distribution</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                          <span>High Performers (&gt;15% conv.)</span>
                          <span style={{ fontWeight: 700, color: '#148860' }}>
                            {sellers.filter(s => (s.analytics?.conversion || 0) > 15).length}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                          <span>Average Performers (5-15% conv.)</span>
                          <span style={{ fontWeight: 700, color: '#f57c00' }}>
                            {sellers.filter(s => {
                              const conv = s.analytics?.conversion || 0;
                              return conv >= 5 && conv <= 15;
                            }).length}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                          <span>Needs Improvement (&lt;5% conv.)</span>
                          <span style={{ fontWeight: 700, color: '#d32f2f' }}>
                            {sellers.filter(s => (s.analytics?.conversion || 0) < 5).length}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: 11, color: '#878787', marginBottom: 4 }}>Total Revenue from Traffic</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#148860' }}>
                        ₹{(trafficAnalytics.totalSales > 0 ? (sellers.reduce((sum, s) => sum + (s.analytics?.revenue || 0), 0) / 100000).toFixed(1) : '0')}L
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sales history bars per seller */}
              <div className="admin-panel-full">
                <div className="admin-panel-header">
                  <span className="admin-panel-title"><FiActivity /> 7-Day Sales History by Seller</span>
                </div>
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {sellers.filter(s => s.analytics?.salesHistory?.some(v => v > 0)).map(seller => {
                    const history = seller.analytics!.salesHistory;
                    const maxVal = Math.max(...history, 1);
                    return (
                      <div key={seller.sellerId}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                          <img src={seller.sellerProfile} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                          <span style={{ fontSize: 13, fontWeight: 700 }}>{seller.sellerName}</span>
                          <span style={{ fontSize: 11, color: '#878787', marginLeft: 'auto' }}>
                            Total: {seller.analytics?.totalSales} sales · ₹{(seller.analytics?.revenue || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 60 }}>
                          {history.map((val, i) => (
                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                              <div style={{
                                width: '100%',
                                height: `${Math.round((val / maxVal) * 50)}px`,
                                background: i === 6 ? '#2874f0' : '#e8f0fe',
                                borderRadius: '3px 3px 0 0',
                                minHeight: 4,
                                transition: 'height 0.4s ease',
                              }} />
                              <span style={{ fontSize: 9, color: '#878787' }}>D{i + 1}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* ─── INQUIRIES ──────────────────────────────────────────── */}
          {activeTab === 'inquiries' && (
            <div className="admin-panel-full">
              <div className="admin-panel-header">
                <span className="admin-panel-title"><FiMail /> Buyer Inquiries</span>
              </div>
              <div className="admin-filter-bar">
                {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
                  <button key={f} className={`admin-filter-btn ${inquiryFilter === f ? 'active' : ''}`}
                    onClick={() => setInquiryFilter(f)}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                    <span className="admin-filter-count">
                      {f === 'all' ? inquiries.length : inquiries.filter(i => i.status === f).length}
                    </span>
                  </button>
                ))}
              </div>
              {filteredInquiries.length === 0 ? (
                <div className="admin-empty">
                  <FiMail />
                  <p>No {inquiryFilter !== 'all' ? inquiryFilter : ''} inquiries found.</p>
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr><th>Product</th><th>Buyer</th><th>Phone</th><th>Seller</th><th>Date</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {filteredInquiries.map(inq => (
                      <tr key={inq.id}>
                        <td>
                          <div className="tbl-product-cell">
                            <img src={inq.productImage} alt="" className="tbl-product-img" />
                            <div>
                              <div className="tbl-product-name">{inq.productName}</div>
                              <div className="tbl-product-sub">₹{inq.productPrice.toLocaleString('en-IN')}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="tbl-product-name">{inq.buyerName}</div>
                          <div className="tbl-product-sub">{inq.buyerEmail}</div>
                        </td>
                        <td>{inq.buyerPhone}</td>
                        <td>{inq.sellerName}</td>
                        <td>{inq.timestamp}</td>
                        <td><StatusPill status={inq.status} /></td>
                        <td>
                          <div className="tbl-actions">
                            <button className="tbl-btn tbl-btn-view" onClick={() => setSelectedInquiry(inq)}><FiEye /></button>
                            {inq.status === 'pending' && <>
                              <button className="tbl-btn tbl-btn-approve" onClick={() => handleApproveInquiry(inq.id)}><FiCheckCircle /></button>
                              <button className="tbl-btn tbl-btn-reject"  onClick={() => handleRejectInquiry(inq.id)}><FiXCircle /></button>
                            </>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ─── LISTING APPROVALS ──────────────────────────────────── */}
          {activeTab === 'listings' && (
            <div className="admin-panel-full">
              <div className="admin-panel-header">
                <span className="admin-panel-title"><FiPackage /> Listing Approvals</span>
              </div>
              <div className="admin-filter-bar">
                {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
                  <button key={f} className={`admin-filter-btn ${listingFilter === f ? 'active' : ''}`}
                    onClick={() => setListingFilter(f)}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                    <span className="admin-filter-count">
                      {f === 'all' ? pendingListings.length : pendingListings.filter(l => l.status === f).length}
                    </span>
                  </button>
                ))}
              </div>
              {filteredListings.length === 0 ? (
                <div className="admin-empty"><FiPackage /><p>No listings found.</p></div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr><th>Pet / Product</th><th>Category</th><th>Price</th><th>Seller</th><th>Submitted</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {filteredListings.map(listing => (
                      <tr key={listing.id}>
                        <td>
                          <div className="tbl-product-cell">
                            <img src={listing.productImage} alt="" className="tbl-product-img" />
                            <div className="tbl-product-name">{listing.productName}</div>
                          </div>
                        </td>
                        <td>{listing.productType}</td>
                        <td>₹{listing.productPrice.toLocaleString('en-IN')}</td>
                        <td>{listing.sellerName}</td>
                        <td>{listing.submittedAt}</td>
                        <td><StatusPill status={listing.status} /></td>
                        <td>
                          <div className="tbl-actions">
                            <button className="tbl-btn tbl-btn-view" onClick={() => setSelectedListing(listing)}><FiEye /></button>
                            {listing.status === 'pending' && <>
                              <button className="tbl-btn tbl-btn-approve" onClick={() => handleApproveListing(listing.id)}><FiCheckCircle /></button>
                              <button className="tbl-btn tbl-btn-reject"  onClick={() => handleRejectListing(listing.id)}><FiXCircle /></button>
                            </>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ─── SELLERS ────────────────────────────────────────────── */}
          {activeTab === 'sellers' && (
            <div className="admin-panel-full">
              <div className="admin-panel-header">
                <span className="admin-panel-title"><MdStorefront /> All Sellers</span>
              </div>
              <table className="admin-table">
                <thead>
                  <tr><th>Seller</th><th>Location</th><th>Listings</th><th>Sales</th><th>Revenue</th><th>Views</th><th>Conv.</th><th>Rating</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {sellers.map(s => (
                    <tr key={s.sellerId}>
                      <td>
                        <div className="tbl-user-cell">
                          <img src={s.sellerProfile} alt="" className="tbl-product-img" style={{ borderRadius: '50%' }} />
                          <div>
                            <div className="tbl-product-name">{s.sellerName}</div>
                            <div className="tbl-product-sub">{s.sellerId}</div>
                          </div>
                        </div>
                      </td>
                      <td>{s.sellerLocation}</td>
                      <td>{s.productIds?.length ?? 0}</td>
                      <td style={{ fontWeight: 700 }}>{s.analytics?.totalSales ?? 0}</td>
                      <td>₹{(s.analytics?.revenue ?? 0).toLocaleString('en-IN')}</td>
                      <td>{(s.analytics?.storeViews ?? 0).toLocaleString('en-IN')}</td>
                      <td>{s.analytics?.conversion ?? 0}%</td>
                      <td>{s.analytics?.storeRating ?? '—'} ★</td>
                      <td><StatusPill status={s.productIds?.length ? 'approved' : 'pending'} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ─── USERS ──────────────────────────────────────────────── */}
          {activeTab === 'users' && (
            <div className="admin-panel-full">
              <div className="admin-panel-header">
                <span className="admin-panel-title"><FiUsers /> Registered Users</span>
              </div>
              <table className="admin-table">
                <thead>
                  <tr><th>User</th><th>Email</th><th>Phone</th><th>Gender</th><th>DOB</th><th>Addresses</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.UserId}>
                      <td>
                        <div className="tbl-user-cell">
                          <img src={u.sellerProfile} alt="" className="tbl-product-img" style={{ borderRadius: '50%' }} />
                          <div>
                            <div className="tbl-product-name">{u.UserName}</div>
                            <div className="tbl-product-sub">{u.UserId}</div>
                          </div>
                        </div>
                      </td>
                      <td>{u.UserEmail}</td>
                      <td>{u.UserNumber}</td>
                      <td>{u.Gender || '—'}</td>
                      <td>{u.dateOfBirth || '—'}</td>
                      <td>{u.addresses?.length ?? 0}</td>
                      <td><StatusPill status="approved" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>

      {/* Modals */}
      {selectedInquiry && (
        <InquiryModal inquiry={selectedInquiry} onClose={() => setSelectedInquiry(null)}
          onApprove={handleApproveInquiry} onReject={handleRejectInquiry} />
      )}
      {selectedListing && (
        <ListingModal listing={selectedListing} onClose={() => setSelectedListing(null)}
          onApprove={handleApproveListing} onReject={handleRejectListing} />
      )}

      {/* Toast */}
      {toast && <div className={`admin-toast ${toast.type === 'error' ? 'error' : ''}`}>{toast.msg}</div>}
    </div>
    </>
  );
};

export default Admin;
