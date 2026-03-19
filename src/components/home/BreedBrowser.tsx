import React, { useRef } from 'react';
import type { Product } from '../../hooks/useSearchData';

interface BreedBrowserProps {
  products: Product[];
}

const BreedBrowser: React.FC<BreedBrowserProps> = ({ products }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -250 : 250,
      behavior: 'smooth',
    });
  };

  const petProducts = products.filter((p) => p.productCategory === 'Pets');

  return (
    <section className="breed-section">
      <button className="arrow left" onClick={() => scroll('left')}>
        <svg viewBox="0 0 24 24"><path d="M15 18L9 12L15 6" /></svg>
      </button>

      <div className="breed-scroll-wrapper">
        <div className="breed-scroll" ref={scrollRef}>
          {petProducts.map((product) => (
            <div key={product.productId} className="breed-card">
              <div className="img-box">
                <img src={product.productMedia[0]} alt={product.productSubCategory} />
              </div>
              <p className="breed-name">{product.productSubCategory}</p>
            </div>
          ))}
        </div>
      </div>

      <button className="arrow right" onClick={() => scroll('right')}>
        <svg viewBox="0 0 24 24"><path d="M9 18L15 12L9 6" /></svg>
      </button>
    </section>
  );
};

export default BreedBrowser;
