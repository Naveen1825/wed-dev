import React from 'react';
import { useSearchData } from '@/hooks/useSearchData';
import { Loading } from '@/components/common/Loading';
import { ListingGrid } from '@/features/public/ListingGrid';
import BreedBrowser from "@/components/home/BreedBrowser"; // Will refactor to features/public next
import TopSellingPets from "@/components/home/SellerGrid"; // Will refactor to features/public next
import TrustFeatures from "@/components/home/TrustFeatures";
import "@/App.css";

/**
 * Home Page.
 * Orchestrates the primary pet marketplace experience with breed browsing,
 * featured listings, and trust-building components.
 * Refactored to eliminate duplicate listing JSX by leveraging the Public ListingGrid feature.
 */
const Home: React.FC = () => {
  const { products, loading } = useSearchData();

  if (loading) return <Loading fullScreen={true} />;

  return (
    <div className="home-content">
      {/* 1. Specialized Browsing Experiences */}
      <BreedBrowser products={products} />

      {/* 2. Core Listing Discovery - Unified Grid Feature */}
      <ListingGrid 
        products={products as any} 
        title="Trending Pet Listings"
        subtitle="Explore the latest additions to the AniSell community."
        columns={4}
      />

      {/* 3. Social Proof and Verified Merchants */}
      <TopSellingPets products={products} />

      {/* 4. Strategic Platform Differentiators */}
      <TrustFeatures />
    </div>
  );
};

export default Home;
