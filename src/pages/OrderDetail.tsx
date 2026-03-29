import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiMapPin, FiTruck, FiPackage, FiCheckCircle, FiClock } from 'react-icons/fi';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useSearchData } from '../hooks/useSearchData';
import './OrderDetail.css';

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { users, products, loading } = useSearchData();

  // Find the required order across all users (for mock purposes)
  const orderData = useMemo(() => {
    for (const u of users) {
      if (u.orders) {
        const found = u.orders.find(o => o.orderId === id);
        if (found) return { order: found, user: u };
      }
    }
    return null;
  }, [users, id]);

  const product = useMemo(() => {
    return products.find(p => p.productId === orderData?.order.productId);
  }, [products, orderData]);

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

  if (!orderData || !product) {
    return (
      <div className="order-detail-page">
        <Navbar />
        <div className="order-detail-container" style={{ textAlign: 'center', padding: '100px 0' }}>
          <h2>Order Not Found</h2>
          <p style={{ color: '#888', marginTop: '10px' }}>The requested order ID does not exist or you do not have permission to view it.</p>
          <button className="btn-primary-blue" style={{ marginTop: '20px' }} onClick={() => navigate('/profile')}>Return to Profile</button>
        </div>
        <Footer />
      </div>
    );
  }

  const { order, user } = orderData;
  const isDelivered = order.status === 'DELIVERED';
  const isCancelled = order.status === 'CANCELLED';

  // Mock tracking timestamps (in a real app, from the server)
  const orderDateObj = new Date(order.orderDate);
  
  const mockTrackingInfo = isCancelled ? [
    { date: order.orderDate, time: '10:30 AM', location: 'System', status: 'Order Placed', icon: <FiPackage /> },
    { date: order.orderDate, time: '11:45 AM', location: 'System', status: 'Order Processing', icon: <FiClock /> },
    { date: order.orderDate, time: '02:15 PM', location: 'System', status: 'Order Cancelled', icon: <FiCheckCircle /> },
  ] : [
    { date: order.orderDate, time: '10:30 AM', location: 'System', status: 'Order Placed', icon: <FiPackage /> },
    { date: new Date(orderDateObj.getTime() + 86400000).toISOString().split('T')[0], time: '14:20 PM', location: 'Warehouse, Mumbai', status: 'Packed & Ready', icon: <FiPackage /> },
    { date: new Date(orderDateObj.getTime() + 86400000 * 2).toISOString().split('T')[0], time: '08:45 AM', location: 'Transit Hub, Delhi', status: 'In Transit', icon: <FiTruck /> },
    { date: new Date(orderDateObj.getTime() + 86400000 * 3).toISOString().split('T')[0], time: '09:10 AM', location: 'Local Hub, Connaught Place', status: 'Out for Delivery', icon: <FiMapPin /> },
    { date: new Date(orderDateObj.getTime() + 86400000 * 3).toISOString().split('T')[0], time: '15:30 PM', location: 'Delivery Address', status: 'Delivered successfully', icon: <FiCheckCircle /> }
  ];

  // If not delivered yet, slice the tracking to show progress
  const trackingSteps = isDelivered || isCancelled 
    ? mockTrackingInfo.reverse() 
    : mockTrackingInfo.slice(0, 3).reverse(); // Just a mock slice

  return (
    <div className="order-detail-page">
      <Navbar />

      <main className="order-detail-container">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FiArrowLeft /> Back to Orders
        </button>

        <div className="od-header">
          <div className="od-header-info">
            <h1>Order Details</h1>
            <p>ID: #{order.orderId} • Placed on {orderDateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="od-header-actions">
            <button className="btn-outline-blue">Download Invoice</button>
          </div>
        </div>

        <div className="od-grid">
          {/* Main Content - Tracking */}
          <div className="od-main">
            <div className="od-card">
              <div className="od-card-header">
                <h3>{isDelivered ? 'Delivery Status' : (isCancelled ? 'Order Cancelled' : 'Tracking Status')}</h3>
                <span className={`status-badge ${order.status.toLowerCase()}`}>{order.status}</span>
              </div>
              
              {/* Vertical Tracking Line */}
              <div className="od-tracking-vertical">
                {trackingSteps.map((step, idx) => (
                  <div key={idx} className={`tracking-step ${idx === 0 ? 'current' : ''}`}>
                    <div className="tracking-icon">{step.icon}</div>
                    <div className="tracking-content">
                      <h4 className="tracking-title">{step.status}</h4>
                      <div className="tracking-meta">
                        <span>{new Date(step.date).toLocaleDateString()} at {step.time}</span>
                        {step.location && (
                          <>
                            <span className="dot">•</span>
                            <span>{step.location}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="od-card">
              <div className="od-card-header">
                <h3>Product Details</h3>
              </div>
              <div className="od-product-item">
                <img src={product.productMedia[0]} alt="" className="od-product-img" />
                <div className="od-product-details">
                  <h4>{product.productSubCategory}</h4>
                  <p className="od-product-meta">{product.productType} • {product.productCategory}</p>
                  <p className="od-product-seller">Sold by: {product.sellerName || 'AniSell Partner'}</p>
                </div>
                <div className="od-product-price">
                  <span className="qty">Qty: 1</span>
                  <span className="price">₹{order.amount.toLocaleString()}</span>
                </div>
              </div>
              <div className="od-actions-row">
                <button className="btn-primary-blue" onClick={() => navigate(`/product/${product.productId}`)}>Buy it again</button>
                <button className="btn-outline-dark">Write Review</button>
              </div>
            </div>
          </div>

          {/* Sidebar Area - Address & Payment */}
          <div className="od-sidebar">
            <div className="od-card">
              <div className="od-card-header">
                <h3>Shipping Address</h3>
              </div>
              <div className="od-address">
                <p className="od-address-name">{user.UserName}</p>
                <p>{user.addresses?.[0]?.addressLine || 'Flat 202, Block C, Heritage Apts'}</p>
                <p>{user.addresses?.[0]?.locality || 'Connaught Place'}</p>
                <p>{user.addresses?.[0]?.city || 'Delhi'}, {user.addresses?.[0]?.state || 'Delhi'} - {user.addresses?.[0]?.pincode || '110001'}</p>
                <p className="od-phone">Phone: {user.addresses?.[0]?.phone || user.UserNumber}</p>
              </div>
            </div>

            <div className="od-card">
              <div className="od-card-header">
                <h3>Order Summary</h3>
              </div>
              <div className="od-summary-row">
                <span>Item Total</span>
                <span>₹{order.amount.toLocaleString()}</span>
              </div>
              <div className="od-summary-row">
                <span>Delivery Fee</span>
                <span className="free">FREE</span>
              </div>
              <div className="od-summary-row">
                <span>GST (18%)</span>
                <span>₹{(order.amount * 0).toLocaleString()}</span> {/* Simplified for mock */}
              </div>
              <div className="od-summary-divider"></div>
              <div className="od-summary-row total">
                <span>Grand Total</span>
                <span>₹{order.amount.toLocaleString()}</span>
              </div>
              <div className="od-payment-method">
                <p className="paid-via">Paid via UPI •••• 9382</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderDetail;
