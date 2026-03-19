import "./App.css";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import BreedBrowser from "./components/home/BreedBrowser";
import Marketplace from "./components/home/Marketplace";
import SellerGrid from "./components/home/SellerGrid";
import TrustFeatures from "./components/home/TrustFeatures";

// Hooks
import { useSearchData } from "./hooks/useSearchData";

/**
 * Home Component
 * 
 * The main landing page of AniSell.
 * Displays breed browsing, pet marketplace, top sellers, and trust features.
 */
function Home() {
  const { products, sellers, loading } = useSearchData();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <main className="home-content">
        {/* Breed Browsing Section */}
        <BreedBrowser products={products} />

        {/* Core Marketplace Section */}
        <Marketplace products={products} />

        {/* Verified Community Section */}
        <SellerGrid sellers={sellers} />

        {/* Authenticity Features Section */}
        <TrustFeatures />
      </main>

      <Footer />
    </>
  );
}

export default Home;