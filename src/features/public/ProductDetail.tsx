import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiChevronLeft, FiStar, FiMessageSquare, FiPlayCircle, 
  FiCalendar, FiMapPin, FiX, FiSend, FiPackage 
} from 'react-icons/fi';
import { FaMars, FaVenus, FaVenusMars } from 'react-icons/fa';
import { MdEmail, MdVerified } from 'react-icons/md';
import { useSearchData } from '@/hooks/useSearchData';
import { InquiryService } from '@/services/api/InquiryService';
import { ProductCard } from '@/components/ui/ProductCard';
import { Input } from '@/components/ui/Input';
import { ROUTES } from '@/constants/routes';
import type { Product, User } from '@/types';
import './ProductDetail.css';

/**
 * Review Item Component.
 * Standardized review display for pet listings.
 */
const ReviewCard: React.FC<{ review: any; user: User | null }> = ({ review, user }) => (
  <div className="review-card">
    <div className="review-user-info">
      <div className="review-user-avatar">
        <img
          src={user?.photoURL || 'https://www.w3schools.com/howto/img_avatar.png'}
          alt={user?.displayName || 'User'}
          className="review-avatar-img"
        />
      </div>
      <div className="user-details">
        <span className="user-name">{user?.displayName || 'Anonymous'}</span>
        <span className="review-date">{review.datetime}</span>
      </div>
      <div className="review-rating">
        {[...Array(5)].map((_, i) => (
          <FiStar key={i} className={i < review.rating ? "star-filled" : "star-empty"} />
        ))}
      </div>
    </div>
    <p className="review-comment">{review.comment}</p>
  </div>
);

/**
 * Contact Seller Modular Overlay.
 */
const ContactSellerModal: React.FC<{
  product: Product;
  onClose: () => void;
}> = ({ product, onClose }) => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setError('Required fields must be completed.');
      return;
    }
    
    setLoading(true);
    try {
      await InquiryService.saveInquiry({
        productId: product.productId,
        productName: product.productSubCategory,
        productImage: product.productMedia?.[0] || '',
        productPrice: product.productPrice,
        sellerName: product.sellerName || 'Verified Merchant',
        buyerName: form.name,
        buyerEmail: form.email,
        buyerPhone: form.phone,
        message: form.message || 'No specific inquiries provided.'
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inquiry-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="inquiry-card">
        <header className="inquiry-header">
           <h3 className="inquiry-title">Portal Inquiry Hub</h3>
           <button onClick={onClose} className="close-btn"><FiX /></button>
        </header>

        {submitted ? (
          <div className="success-view">
             <div className="success-icon">✅</div>
             <h3 className="success-title">Discovery Logged</h3>
             <p className="success-text">Your inquiry for {product.productSubCategory} has been queued for verification.</p>
             <button onClick={onClose} className="button-base button-primary">Close Porter</button>
          </div>
        ) : (
          <form className="inquiry-form" onSubmit={handleSubmit}>
             <div className="inquiry-product-strip">
               <img src={product.productMedia?.[0]} alt="" />
               <div>
                  <strong>{product.productSubCategory}</strong>
                  <div className="price">₹{product.productPrice.toLocaleString()}</div>
               </div>
             </div>

             <div className="form-fields">
                <Input label="Identity Title" placeholder="Arjun Kumar" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                <Input label="Verified Email" type="email" placeholder="contact@arjun.com" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                <Input label="Contact Mobile" placeholder="+91 XXXXX XXXXX" required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                <Input label="Discovery Notes" as="textarea" placeholder="Specific questions..." value={form.message} onChange={e => setForm({...form, message: e.target.value})} />
                
                {error && <div className="error-msg">{error}</div>}
                
                <button type="submit" className="button-base button-primary" disabled={loading}>
                   <FiSend /> {loading ? 'Processing...' : 'Send Marketplace Inquiry'}
                </button>
             </div>
          </form>
        )}
      </div>
    </div>
  );
};

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, users, loading } = useSearchData();
  const [product, setProduct] = useState<Product | null>(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [contactOpen, setContactOpen] = useState(false);

  useEffect(() => {
    if (!loading && products.length > 0) {
      const found = products.find(p => p.productId === id);
      setProduct(found || null);
      setActiveMediaIndex(0);
    }
  }, [id, products, loading]);

  const related = useMemo(() => {
    if (!product) return [];
    return products
      .filter(p => p.productCategory === product.productCategory && p.productId !== product.productId)
      .slice(0, 4);
  }, [product, products]);

  if (loading || !product) {
    return <div className="loading-container"><div className="spinner" /></div>;
  }

  const isVideo = (url: string) => url.toLowerCase().endsWith('.mp4');
  const isMale = product.productGender.toLowerCase() === 'male';

  return (
    <div className="product-detail-workspace">
      <main className="product-discovery-container">
        <nav className="discovery-nav">
          <button onClick={() => navigate(-1)} className="back-btn"><FiChevronLeft /> Back to Discovery</button>
        </nav>

        <section className="product-core-grid">
          <div className="media-visuals">
            <div className="main-viewport">
              {isVideo(product.productMedia[activeMediaIndex]) ? (
                <video src={product.productMedia[activeMediaIndex]} className="media-object" controls autoPlay loop muted />
              ) : (
                <img src={product.productMedia[activeMediaIndex]} alt="" className="media-object" />
              )}
            </div>
            <div className="media-thumbnails">
              {product.productMedia.map((url, idx) => (
                <div key={idx} className={`thumb ${idx === activeMediaIndex ? 'active' : ''}`} onClick={() => setActiveMediaIndex(idx)}>
                  {isVideo(url) ? <FiPlayCircle /> : <img src={url} alt="" />}
                </div>
              ))}
            </div>
          </div>

          <div className="product-meta-panel">
            <div className="header-strip">
              <h1 className="listing-title">{product.productSubCategory}</h1>
              <div className={`gender-tag ${product.productIsPair ? 'pair' : isMale ? 'male' : 'female'}`}>
                {product.productIsPair ? <FaVenusMars /> : isMale ? <FaMars /> : <FaVenus />}
                <span>{product.productGender}</span>
              </div>
            </div>
            <div className="listing-price">₹{product.productPrice.toLocaleString()}</div>

            <div className="data-group">
              <h3 className="group-title">Discovery Information</h3>
              <p className="group-text">{product.productDescription}</p>
            </div>

            <div className="data-group">
              <h3 className="group-title">Listing Metrics</h3>
              <ul className="metrics-list">
                <li><MdVerified /> <strong>Vaccinated:</strong> {product.productVaccinated ? 'Standard Verified' : 'Limited'}</li>
                <li><FiCalendar /> <strong>Age Cycle:</strong> {product.productAge}</li>
                <li><FiMapPin /> <strong>Distribution Center:</strong> {product.sellerLocation || 'Global Marketplace'}</li>
              </ul>
            </div>

            <div className="action-cluster" style={{ display: 'flex', gap: '12px' }}>
              <button className="button-base button-primary portal-cta" onClick={() => setContactOpen(true)} style={{ flex: 1 }}>
                <MdEmail /> Request Identity
              </button>
              <button 
                className="button-base button-secondary portal-cta" 
                onClick={() => navigate(ROUTES.CHECKOUT.replace(':id', product.productId))}
                style={{ flex: 1, backgroundColor: '#10b981', color: 'white' }}
              >
                <FiPackage /> Adopt Participant
              </button>
            </div>
          </div>
        </section>

        <section className="discovery-extensions">
          <h2 className="extension-title">Similar Pet Listings</h2>
          <div className="discovery-grid">
            {related.map(item => <ProductCard key={item.productId} product={item} variant="standard" />)}
          </div>
        </section>

        <section className="verification-hub">
          <h2 className="hub-title">
            <FiMessageSquare /> <span>Community Feedback ({product.productReviews?.length || 0})</span>
          </h2>
          <div className="hub-layout">
            <div className="hub-list">
              {product.productReviews?.length ? product.productReviews.map((r, i) => (
                <ReviewCard key={i} review={r} user={users.find(u => u.uid === r.userId) || null} />
              )) : <div className="no-review-placeholder">No community feedback captured for this listing yet.</div>}
            </div>
          </div>
        </section>
      </main>

      {contactOpen && (
        <ContactSellerModal product={product} onClose={() => setContactOpen(false)} />
      )}
    </div>
  );
};

export default ProductDetail;
