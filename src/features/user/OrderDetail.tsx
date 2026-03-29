import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiTruck, FiPackage, FiCheckCircle, FiClock } from 'react-icons/fi';
import { useSearchData } from '@/hooks/useSearchData';
import { Badge } from '@/components/ui/Badge';
import { ROUTES } from '@/constants/routes';
import './OrderDetail.css';

/**
 * Order Tracking & Fullfilment Workspace.
 * Orchestrates customer discovery and logistics status for historical pet marketplace acquisitions.
 * Synchronized with the high-fidelity User and Order domain models.
 */
const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { users, products, loading } = useSearchData();

  // Find the required order across all platform identities (Discovery Sync)
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
      <div className="order-workspace-error" style={{ textAlign: 'center', padding: '100px 0' }}>
        <h2>Acquisition Not Found</h2>
        <p style={{ color: '#64748b', marginTop: '10px' }}>The requested order registry does not exist or has restricted access.</p>
        <button className="button-base button-primary" style={{ marginTop: '20px' }} onClick={() => navigate(ROUTES.USER_PROFILE)}>Return to Profile</button>
      </div>
    );
  }

  const { order, user } = orderData;
  const isDelivered = order.status === 'DELIVERED';
  const isCancelled = order.status === 'CANCELLED';

  const orderDateObj = new Date(order.orderDate);
  
  // High-fidelity tracking orchestration
  const trackingSteps = ([
    { date: order.orderDate, time: '10:30 AM', location: 'Identity Verified', status: 'Order Placed', icon: <FiPackage /> },
    { date: order.orderDate, time: '11:45 AM', location: 'Distribution Center', status: 'Order Processing', icon: <FiClock /> },
    { date: order.orderDate, time: '02:15 PM', location: 'Logistics Queue', status: isCancelled ? 'Order Cancelled' : 'In Transit', icon: isCancelled ? <FiCheckCircle /> : <FiTruck /> },
  ]).reverse();

  return (
    <div className="order-workspace">
      <header className="workspace-header">
         <button className="back-discovery-btn" onClick={() => navigate(-1)}>
            <FiArrowLeft /> Back to Discovery Hub
         </button>
         
         <div className="header-meta">
            <h1 className="header-title">Historical Acquisition Log</h1>
            <p className="header-id">Registry #{order.orderId} • Finalized {orderDateObj.toLocaleDateString()}</p>
         </div>
      </header>

      <div className="discovery-columns">
        {/* Fulfillment Center */}
        <div className="discovery-main">
          <section className="portal-card">
            <header className="card-header">
               <h3 className="card-title">Fulfillment Metrics</h3>
               <Badge 
                 variant={isDelivered ? 'success' : isCancelled ? 'error' : 'warning'} 
                 size="md"
               >
                 {order.status}
               </Badge>
            </header>

            <div className="tracking-timeline">
               {trackingSteps.map((step, idx) => (
                 <div key={idx} className={`timeline-node ${idx === 0 ? 'node-active' : ''}`}>
                    <div className="timeline-icon">{step.icon}</div>
                    <div className="timeline-content">
                       <h4 className="node-status">{step.status}</h4>
                       <div className="node-meta">
                          <span>{new Date(step.date).toLocaleDateString()} at {step.time}</span>
                          <span className="dot">•</span>
                          <span>{step.location}</span>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          </section>

          <section className="portal-card">
            <header className="card-header"><h3 className="card-title">Listing Identification</h3></header>
            <div className="listing-item-strip">
               <img src={product.productMedia[0]} alt="" />
               <div className="listing-details">
                  <h4>{product.productSubCategory}</h4>
                  <p className="listing-meta">{product.productType} • {product.productCategory}</p>
                  <p className="listing-merchant">Merchant: {product.sellerName || 'Verified Partner'}</p>
               </div>
               <div className="listing-price">
                  <div className="qty">Quantity: 1</div>
                  <div className="final-price">₹{order.amount.toLocaleString()}</div>
               </div>
            </div>
          </section>
        </div>

        {/* Identity & Fiscal Oversight */}
        <div className="discovery-sidebar">
          <section className="portal-card">
            <header className="card-header"><h3 className="card-title">Distribution Identity</h3></header>
            <div className="identity-block">
               <p className="identity-name">{user.displayName}</p>
               <p className="identity-address">{user.addresses?.[0]?.addressLine || 'Unified Logistics Center'}</p>
               <p className="identity-locality">{user.addresses?.[0]?.locality || 'Verified Cluster'}</p>
               <p className="identity-city">{user.addresses?.[0]?.city || 'Global Site'}, {user.addresses?.[0]?.state || 'Portal'}</p>
               <p className="identity-contact">Verified Mobile: {user.phone}</p>
            </div>
          </section>

          <section className="portal-card">
            <header className="card-header"><h3 className="card-title">Fiscal Summary</h3></header>
            <div className="fiscal-metrics">
               <div className="metric-row"><span>Acquisition Total</span><span>₹{order.amount.toLocaleString()}</span></div>
               <div className="metric-row"><span>Logistics Allocation</span><span className="free">WAIVED</span></div>
               <div className="metric-divider" />
               <div className="metric-row grand-total"><span>Fiscal Settlement</span><span>₹{order.amount.toLocaleString()}</span></div>
               <div className="fiscal-method">Authorized via Verified Payment Cluster</div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
