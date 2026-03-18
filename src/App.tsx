import "./App.css";
import { useState, useEffect, useRef } from "react";
import { FaMapMarkerAlt, FaStar, FaUserShield, FaHospital, FaLock, FaHandshake } from "react-icons/fa";
import { IoMdHeartEmpty } from "react-icons/io";
import { MdVerified } from "react-icons/md";

interface Breed {
  id: number;
  subCategory: string;
  image: string;
  category?: string;
  price?: number;
  age?: string;
  seller?: string;
  location?: string;
  tag?: string;
  originalPrice?: number;
}

interface Seller {
  id: number;
  name: string;
  avatar: string;
  location: string;
  rating: number;
  pets: number;
}

function App() {
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/breed.json")
      .then((res) => res.json())
      .then((data) => setBreeds(data))
      .catch((err) => console.error("Breed loading error:", err));

    fetch("/sellers.json")
      .then((res) => res.json())
      .then((data) => setSellers(data))
      .catch((err) => console.error("Sellers loading error:", err));
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollBy({
      left: direction === "left" ? -250 : 250,
      behavior: "smooth",
    });
  };

  const displayedBreeds = breeds.slice(0, 6);

  return (
    <>
      {/* NAVIGATION */}
      <nav className="nav">
        <img
          src="https://anisell.in/wp-content/uploads/2025/06/91-93450-29589-1.png"
          alt="logo"
          className="logo"
        />

        <div className="search">
          <input type="text" placeholder="Search" />
          <button>Search</button>
        </div>
        {/* <img src="/user-profile.png" alt="User" className="user-image"/> */}
        <button className="login-btn">Sign in / Up</button>
      </nav>

      {/* BREED BROWSER */}
      <section className="breed-section">

        <button className="arrow left" onClick={() => scroll("left")}>
          <svg viewBox="0 0 24 24">
            <path d="M15 18L9 12L15 6"/>
          </svg>
        </button>

        <div className="breed-scroll-wrapper">

          <div className="breed-scroll" ref={scrollRef}>
            {breeds.map((breed) => (
              <div key={breed.id} className="breed-card">
                <div className="img-box">
                  <img src={breed.image} alt={breed.subCategory} />
                </div>

                <p className="breed-name">{breed.subCategory}</p>
              </div>
            ))}
          </div>

        </div>

        <button className="arrow right" onClick={() => scroll("right")}>
          <svg viewBox="0 0 24 24">
            <path d="M9 18L15 12L9 6"/>
          </svg>
        </button>

      </section>

      {/* PET MARKETPLACE SECTION */}
      <section className="marketplace-section">
        <div className="marketplace-header">
          <span className="badge">PET MARKETPLACE</span>
          <h2>Find Your Perfect Companion</h2>
          <p>Browse our curated selection of healthy pets from verified sellers.</p>
        </div>

        <div className="pet-grid">
          {displayedBreeds.map((pet) => (
            <div key={pet.id} className="pet-card-main">
              <div className="pet-image-wrapper">
                {pet.tag && <span className={`pet-tag ${pet.tag.toLowerCase()}`}>{pet.tag}</span>}
                <button className="favorite-btn">
                  <IoMdHeartEmpty />
                </button>
                <img src={pet.image} alt={pet.subCategory} className="pet-image" />
              </div>
              
              <div className="pet-info">
                <div className="pet-title-row">
                  <h3 className="pet-name-main">{pet.subCategory}</h3>
                  <span className="pet-age">{pet.age || "Unknown age"}</span>
                </div>
                
                <div className="pet-price-row">
                  <span className="pet-price">₹{pet.price?.toLocaleString('en-IN') || "N/A"}</span>
                  {pet.originalPrice && <span className="pet-original-price">₹{pet.originalPrice?.toLocaleString('en-IN')}</span>}
                </div>
                
                <div className="pet-seller-row">
                  <div className="pet-seller">
                    <MdVerified className="verified-icon" />
                    <span>{pet.seller || "Verified Seller"}</span>
                  </div>
                  <div className="pet-location">
                    <FaMapMarkerAlt className="location-icon" />
                    <span>{pet.location || "Location N/A"}</span>
                  </div>
                </div>
                
                <button className="view-details-btn">View Details</button>
              </div>
            </div>
          ))}
        </div>

        <div className="view-all-container">
          <button className="view-all-btn">
            View All Pets <span>→</span>
          </button>
        </div>
      </section>

      {/* SELLERS SECTION */}
      <section className="sellers-section">
        <div className="sellers-header">
          <span className="badge">OUR COMMUNITY</span>
          <h2>Trusted Sellers</h2>
          <p>All sellers are verified and authorized to list on Anisell.</p>
        </div>

        <div className="sellers-grid-minimal">
          {sellers.map((seller) => (
            <div key={seller.id} className="seller-card-minimal">
              <div className="seller-avatar-minimal">{seller.avatar}</div>
              <h3 className="seller-name-minimal">
                <MdVerified className="verified-icon-minimal" /> {seller.name}
              </h3>
              <p className="seller-location-minimal">{seller.location}</p>
              <div className="seller-meta-minimal">
                <span className="seller-rating-minimal"><FaStar /> {seller.rating}</span>
                <span className="dot">•</span>
                <span className="seller-pets-minimal">{seller.pets} Pets</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TRUST FEATURES SECTION */}
      <section className="features-section">
        <div className="features-container">
          <div className="feature-item">
            <div className="feature-icon-box">
              <FaUserShield className="feature-icon" />
            </div>
            <h4>Verified Sellers</h4>
            <p>Every seller is background-checked and verified before listing.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon-box">
              <FaHospital className="feature-icon" />
            </div>
            <h4>Healthy Pets</h4>
            <p>All pets come with health certificates from licensed vets.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon-box">
              <FaLock className="feature-icon" />
            </div>
            <h4>Secure Payments</h4>
            <p>Buyer protection on all transactions with end-to-end encryption.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon-box">
              <FaHandshake className="feature-icon" />
            </div>
            <h4>Trusted Marketplace</h4>
            <p>India's most trusted platform to buy pets from certified sellers.</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="main-footer">
        <div className="footer-top">
          <div className="footer-column brand-col">
            <div className="footer-logo">
              <span className="logo-paw">🐾</span>
              <span className="logo-text">AniSell</span>
            </div>
            <p className="footer-desc">
              India's most trusted pet marketplace. Buy healthy pets and accessories from verified sellers.
            </p>
          </div>

          <div className="footer-column">
            <h5>COMPANY</h5>
            <ul>
              <li><a href="#">About Us</a></li>
              <li><a href="#">How It Works</a></li>
              <li><a href="#">Seller Registration</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Careers</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h5>SHOP</h5>
            <ul>
              <li><a href="#">Dogs</a></li>
              <li><a href="#">Cats</a></li>
              <li><a href="#">Birds</a></li>
              <li><a href="#">Fish & Aquatics</a></li>
              <li><a href="#">Pet Accessories</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h5>SUPPORT</h5>
            <ul>
              <li><a href="#">Contact Us</a></li>
              <li><a href="#">FAQs</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Buyer Protection</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-container">
            <p className="copyright">
              © 2025 Anisell. All rights reserved. 🐾
            </p>
            <div className="dev-credits">
              <img src="https://bustling-trick-3d0.notion.site/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fpublic.notion-static.com%2Fd344584e-e21a-4e9c-8765-8f7d563070cc%2Fdeadend_logo_(3).png?table=custom_emoji&id=3139801e-d37b-80f2-a1b7-007a38c942a5&spaceId=5739801e-d37b-8171-934c-0003c9bb7643&width=160&userId=&cache=v2" alt="Dev Logo" className="dev-logo" />
              <span>Developed by <a href="mailto:deadendengineer@gmail.com">deadendengineer@gmail.com</a></span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

export default App;