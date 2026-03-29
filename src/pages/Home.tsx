import "../App.css";

// Components
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import BreedBrowser from "../components/home/BreedBrowser";
import Marketplace from "../components/home/Marketplace";
import TopSellingPets from "../components/home/SellerGrid";
import TrustFeatures from "../components/home/TrustFeatures";

// Hooks
import { useSearchData } from "../hooks/useSearchData";

/**
 * Home Component
 * 
 * The main landing page of AniSell.
 * Displays breed browsing, pet marketplace, top selling pets, and trust features.
 */
function Home() {
  const { products, loading } = useSearchData();

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

        {/* Top Selling Pets Section */}
        <TopSellingPets products={products} />

        {/* Authenticity Features Section */}
        <TrustFeatures />
      </main>

      <Footer />
    </>
  );
}

export default Home;
