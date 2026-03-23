import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiHeart, FiStar, FiMessageSquare, FiPlayCircle, FiCalendar, FiMapPin, FiX, FiSend } from 'react-icons/fi';
import { FaMars, FaVenus, FaVenusMars } from 'react-icons/fa';
import { MdEmail, MdVerified } from 'react-icons/md';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProductCard from './components/common/ProductCard';
import { useSearchData } from './hooks/useSearchData';
import { saveInquiry } from './Admin';
import type { Product, User } from './hooks/useSearchData';
import type { Inquiry } from './Admin';
import './ProductDetail.css';

// --- Sub-Components ---

/**
 * Review Item Component
 */
const ReviewCard: React.FC<{ review: any; user: User | null }> = ({ review, user }) => (
  <div className="review-card">
    <div className="review-user-info">
      <div className="review-user-avatar">
        <img
          src={user?.sellerProfile || 'https://www.w3schools.com/howto/img_avatar.png'}
          alt={user?.UserName || 'User'}
          className="review-avatar-img"
        />
      </div>
      <div className="user-details">
        <span className="user-name">{user?.UserName || 'Anonymous'}</span>
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
 * Contact Seller Modal — captures buyer info and sends to admin queue
 */
const ContactSellerModal: React.FC<{
  product: Product;
  onClose: () => void;
}> = ({ product, onClose }) => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    const inquiry: Inquiry = {
      id: `inq_${Date.now()}`,
      productId: product.productId,
      productName: product.productSubCategory,
      productImage: product.productMedia?.[0] || '',
      productPrice: product.productPrice,
      sellerName: product.sellerName || 'Unknown Seller',
      buyerName: form.name,
      buyerEmail: form.email,
      buyerPhone: form.phone,
      message: form.message || 'No message provided.',
      timestamp: new Date().toLocaleString('en-IN').replace(',', ''),
      status: 'pending',
    };
    saveInquiry(inquiry);
    setSubmitted(true);
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 500,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        backdropFilter: 'blur(4px)',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: 'white', borderRadius: 20, width: '100%', maxWidth: 480,
        boxShadow: '0 24px 64px rgba(0,0,0,0.2)', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 800, margin: 0 }}>Contact Seller</h3>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0' }}>Your inquiry will be reviewed by our team first</p>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, border: '1px solid #e2e8f0', borderRadius: 8, background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiX />
          </button>
        </div>

        {submitted ? (
          /* Success State */
          <div style={{ padding: '40px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Inquiry Sent!</h3>
            <p style={{ color: '#64748b', lineHeight: 1.6 }}>
              Your request for <strong>{product.productSubCategory}</strong> has been received.
              Our admin team will verify and forward it to the seller within 24 hours.
            </p>
            <button
              onClick={onClose}
              style={{ marginTop: 24, padding: '12px 32px', background: '#2874f0', color: 'white', border: 'none', borderRadius: 100, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}
            >
              Close
            </button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit}>
            {/* Product info strip */}
            <div style={{ display: 'flex', gap: 12, padding: '16px 24px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
              <img src={product.productMedia?.[0]} alt="" style={{ width: 52, height: 52, borderRadius: 10, objectFit: 'cover' }} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{product.productSubCategory}</div>
                <div style={{ fontSize: 13, color: '#007bff', fontWeight: 700 }}>₹{product.productPrice.toLocaleString('en-IN')}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>Seller: {product.sellerName}</div>
              </div>
            </div>

            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {error && (
                <div style={{ background: '#fff1f1', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#dc2626' }}>
                  {error}
                </div>
              )}

              {[
                { name: 'name', label: 'Your Name *', type: 'text', placeholder: 'e.g. Arjun Kumar' },
                { name: 'email', label: 'Email Address *', type: 'email', placeholder: 'e.g. arjun@email.com' },
                { name: 'phone', label: 'Phone Number *', type: 'tel', placeholder: 'e.g. +91 9988776655' },
              ].map(field => (
                <div key={field.name}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 5, textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>
                    {field.label}
                  </label>
                  <input
                    name={field.name} type={field.type}
                    placeholder={field.placeholder}
                    value={form[field.name as keyof typeof form]}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const }}
                  />
                </div>
              ))}

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 5, textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>
                  Message (optional)
                </label>
                <textarea
                  name="message"
                  placeholder="Any specific questions or preferences?"
                  value={form.message}
                  onChange={handleChange}
                  rows={3}
                  style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, resize: 'none' as const, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const }}
                />
              </div>

              <p style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', lineHeight: 1.5 }}>
                🔒 Your details are shared only with the verified seller after admin review.
              </p>

              <button
                type="submit"
                style={{ width: '100%', padding: '14px', background: '#2874f0', color: 'white', border: 'none', borderRadius: 100, fontWeight: 700, cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                <FiSend /> Send Inquiry
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// --- Main Component ---

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, users, loading } = useSearchData();
  const [product, setProduct] = useState<Product | null>(null);
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(0);
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
    <div className="product-page">
      <Navbar />

      <main className="product-detail-container">
        <nav className="breadcrumb">
          <button onClick={() => navigate(-1)} className="back-btn"><FiChevronLeft /> Back to Search</button>
        </nav>

        <section className="product-main">
          {/* Visuals */}
          <div className="product-visuals">
            <div className="main-image-wrapper">
              {isVideo(product.productMedia[activeMediaIndex]) ? (
                <video src={product.productMedia[activeMediaIndex]} className="main-image" controls autoPlay loop muted />
              ) : (
                <img src={product.productMedia[activeMediaIndex]} alt="" className="main-image" />
              )}
            </div>
            <div className="thumbnail-list">
              {product.productMedia.map((url, idx) => (
                <div key={idx} className={`thumbnail ${idx === activeMediaIndex ? 'active' : ''}`} onClick={() => setActiveMediaIndex(idx)}>
                  {isVideo(url) ? <div className="video-thumbnail-placeholder"><FiPlayCircle className="play-icon" /></div> : <img src={url} alt="" />}
                </div>
              ))}
            </div>
          </div>

          {/* Info Panel */}
          <div className="product-info-panel">
            <div className="title-row">
              <h1 className="product-page-title">{product.productSubCategory}</h1>
              <div className={`gender-badge ${product.productIsPair ? 'pair' : isMale ? 'male' : 'female'}`}>
                {product.productIsPair ? <FaVenusMars className="gender-icon" /> : isMale ? <FaMars className="gender-icon" /> : <FaVenus className="gender-icon" />}
                <span className="gender-text">{product.productGender}</span>
              </div>
            </div>
            <div className="product-page-price">₹{product.productPrice.toLocaleString('en-IN')}</div>

            <div className="detail-section">
              <h3 className="section-heading">Description</h3>
              <p className="section-text">{product.productDescription}</p>
            </div>

            <div className="detail-section">
              <h3 className="section-heading">Specifications</h3>
              <ul className="spec-list">
                <li className="spec-list-item">
                  <MdVerified className={`spec-list-icon ${product.productVaccinated ? 'is-verified' : 'not-verified'}`} />
                  <span className="spec-label">Vaccinated:</span><span className="spec-value">{product.productVaccinated ? 'Yes' : 'No'}</span>
                </li>
                <li className="spec-list-item"><FiCalendar className="spec-list-icon" /><span className="spec-label">Age:</span><span className="spec-value">{product.productAge}</span></li>
                <li className="spec-list-item"><FiMapPin className="spec-list-icon" /><span className="spec-label">Location:</span><span className="spec-value">{product.sellerLocation || 'Bangalore'}</span></li>
              </ul>
            </div>

            <div className="action-button-group">
              <button className="btn-contact-seller" onClick={() => setContactOpen(true)}>
                <MdEmail /> Contact Seller
              </button>
              <button className="btn-wishlist"><FiHeart /> Save</button>
            </div>
          </div>
        </section>

        {/* Related */}
        <section className="related-section">
          <h2 className="related-title">Related Products</h2>
          <div className="related-products-grid">
            {related.map(item => <ProductCard key={item.productId} product={item} />)}
          </div>
        </section>

        {/* Reviews */}
        <section className="reviews-section">
          <h2 className="section-title-with-icon">
            <FiMessageSquare className="title-icon" /> <span>Reviews ({product.productReviews?.length || 0})</span>
          </h2>
          <div className="reviews-layout">
            <div className="reviews-list">
              {product.productReviews?.length ? product.productReviews.map((r, i) => (
                <ReviewCard key={i} review={r} user={users.find(u => u.UserId === r.userId) || null} />
              )) : <div className="no-reviews"><p>No reviews yet.</p></div>}
            </div>
            <div className="post-review-card">
              <h3>Post a Review</h3>
              <div className="rating-selector">
                <span>Rating:</span>
                <div className="stars-input">
                  {[1,2,3,4,5].map(num => (
                    <FiStar key={num} className={num <= rating ? "star-input-icon active" : "star-input-icon"} onClick={() => setRating(num)} />
                  ))}
                </div>
              </div>
              <textarea placeholder="Share your thoughts..." className="review-textarea" value={newComment} onChange={e => setNewComment(e.target.value)} />
              <button className="btn-post-review" onClick={() => { alert('Review submitted!'); setNewComment(""); setRating(0); }}>Submit Review</button>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      {/* Contact Seller Modal */}
      {contactOpen && (
        <ContactSellerModal product={product} onClose={() => setContactOpen(false)} />
      )}
    </div>
  );
};

export default ProductDetail;
