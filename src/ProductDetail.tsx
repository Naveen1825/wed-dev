import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiHeart, FiStar, FiMessageSquare, FiPlayCircle, FiCalendar, FiMapPin } from 'react-icons/fi';
import { FaMars, FaVenus, FaVenusMars } from 'react-icons/fa';
import { MdEmail, MdVerified } from 'react-icons/md';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProductCard from './components/common/ProductCard';
import { useSearchData } from './hooks/useSearchData';
import type { Product, User } from './hooks/useSearchData';
import './ProductDetail.css';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, users, loading } = useSearchData();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(0);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  useEffect(() => {
    if (!loading && products.length > 0) {
      const found = products.find(p => p.productId === id);
      if (found) {
        setProduct(found);
        setRelated(products.filter(p => p.productCategory === found.productCategory && p.productId !== id).slice(0, 4));
        setActiveMediaIndex(0);
      } else {
        setProduct(products[0]);
      }
    }
  }, [id, products, loading]);

  if (loading || !product) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  const isVideo = (url: string) => url.toLowerCase().endsWith('.mp4');
  const getReviewUser = (userId: string): User | null => {
    return users.find(u => u.UserId === userId) || null;
  };

  const isMale = product.productGender.toLowerCase() === 'male';

  return (
    <div className="product-page">
      <Navbar />

      <main className="product-detail-container">
        <nav className="breadcrumb">
          <button onClick={() => navigate(-1)} className="back-btn">
            <FiChevronLeft /> Back to Search
          </button>
        </nav>

        <section className="product-main">
          <div className="product-visuals">
            <div className="main-image-wrapper">
              {isVideo(product.productMedia[activeMediaIndex]) ? (
                <video 
                  src={product.productMedia[activeMediaIndex]} 
                  className="main-image" 
                  controls 
                  autoPlay 
                  loop 
                  muted
                />
              ) : (
                <img src={product.productMedia[activeMediaIndex]} alt={product.productSubCategory} className="main-image" />
              )}
            </div>
            
            <div className="thumbnail-list">
              {product.productMedia.map((url, index) => (
                <div 
                  key={index} 
                  className={`thumbnail ${index === activeMediaIndex ? 'active' : ''}`}
                  onClick={() => setActiveMediaIndex(index)}
                >
                  {isVideo(url) ? (
                    <div className="video-thumbnail-placeholder">
                      <FiPlayCircle className="play-icon" />
                    </div>
                  ) : (
                    <img src={url} alt={`Thumbnail ${index + 1}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="product-info-panel">
            <div className="title-row">
              <h1 className="product-page-title">
                {product.productSubCategory}
              </h1>
              <div className={`gender-badge ${product.productIsPair ? 'pair' : isMale ? 'male' : 'female'}`}>
                {product.productIsPair ? <FaVenusMars className="gender-icon" /> : 
                 isMale ? <FaMars className="gender-icon" /> : <FaVenus className="gender-icon" />}
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
                  {product.productVaccinated && (
                    <MdVerified className="verified-badge-icon" title="Vaccinated" />
                  )}
                  <span className="spec-label">Vaccinated:</span>
                  <span className="spec-value">{product.productVaccinated ? 'Yes' : 'No'}</span>
                </li>
                <li className="spec-list-item">
                  <FiCalendar className="spec-list-icon" />
                  <span className="spec-label">Age:</span>
                  <span className="spec-value">{product.productAge}</span>
                </li>
                <li className="spec-list-item">
                  <FiMapPin className="spec-list-icon" />
                  <span className="spec-label">Location:</span>
                  <span className="spec-value">{product.sellerLocation || 'Bangalore'}</span>
                </li>
              </ul>
            </div>

            <div className="action-button-group">
              <button className="btn-contact-seller" onClick={() => console.log('Contact seller')}>
                <MdEmail /> Contact Seller
              </button>
              <button className="btn-wishlist" onClick={() => console.log('Save to wishlist')}>
                <FiHeart /> Save
              </button>
            </div>
          </div>
        </section>

        <section className="related-section">
          <h2 className="related-title">Related Products</h2>
          <div className="related-products-grid">
            {related.map(item => (
              <ProductCard key={item.productId} product={item} />
            ))}
          </div>
        </section>

        <section className="reviews-section">
          <h2 className="section-title-with-icon">
            <FiMessageSquare className="title-icon" /> 
            <span>Reviews ({product.productReviews?.length || 0})</span>
          </h2>

          <div className="reviews-layout">
            <div className="reviews-list">
              {(product.productReviews && product.productReviews.length > 0) ? (
                product.productReviews.map((review, idx) => {
                  const reviewUser = getReviewUser(review.userId);
                  return (
                    <div key={idx} className="review-card">
                      <div className="review-user-info">
                        <div className="review-user-avatar">
                          <img 
                            src={reviewUser?.sellerProfile || 'https://www.w3schools.com/howto/img_avatar.png'} 
                            alt={reviewUser?.UserName || 'User'} 
                            className="review-avatar-img"
                          />
                        </div>
                        <div className="user-details">
                          <span className="user-name">{reviewUser?.UserName || 'Anonymous'}</span>
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
                })
              ) : (
                <div className="no-reviews">
                  <p>No reviews yet. Share your experience!</p>
                </div>
              )}
            </div>

            <div className="post-review-card">
              <h3>Post a Review</h3>
              <div className="rating-selector">
                <span>Rating:</span>
                <div className="stars-input">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <FiStar 
                      key={num} 
                      className={num <= rating ? "star-input-icon active" : "star-input-icon"}
                      onClick={() => setRating(num)}
                    />
                  ))}
                </div>
              </div>
              <textarea 
                placeholder="Share your thoughts..." 
                className="review-textarea"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              ></textarea>
              <button className="btn-post-review" onClick={() => {
                alert(`Review submitted!`);
                setNewComment("");
                setRating(0);
              }}>Submit Review</button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
