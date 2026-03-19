import React from 'react';
import './ProductCard.css';
import { FaMars, FaVenus, FaVenusMars } from 'react-icons/fa';
import { FiCalendar, FiMapPin} from 'react-icons/fi';
import { MdVerified } from 'react-icons/md';
import type { Product } from '../../hooks/useSearchData';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const isMale = product.productGender.toLowerCase() === 'male';
  
  return (
    <article className="product-card" onClick={() => console.log('View product', product.productId)}>
      <div className="product-card-image-section">
        <img 
          src={product.productMedia[0]} 
          alt={product.productSubCategory} 
          className="product-card-image" 
        />
      </div>
      
      <div className="product-card-body">
        <div className="product-card-header">
          <h2 className="product-card-title">
            {product.productSubCategory}
            {product.productVaccinated && (
              <MdVerified className="verified-badge-icon" title="Vaccinated" />
            )}
             {product.productIsPair ? <FaVenusMars className="gender-icon-pair" /> : 
              isMale ? <FaMars className="gender-icon-male" /> : <FaVenus className="gender-icon-female" />}  
          </h2>
        </div>
        
        <p className="product-card-description">{product.productDescription}</p>

        <div className="product-card-price-section">
          <span className="price-currency">₹</span>
          <span className="price-value">{product.productPrice.toLocaleString('en-IN')}</span>
        </div>

        <footer className="product-card-footer">
          <div className="info-chip">
            <FiMapPin className="chip-icon" />
            <span>{product.sellerLocation || 'Bangalore, KA'}</span>
          </div>
          <div className="info-chip">
            <FiCalendar className="chip-icon" />
            <span>{product.productAge}</span>
          </div>
        </footer>
      </div>
    </article>
  );
};

export default ProductCard;
