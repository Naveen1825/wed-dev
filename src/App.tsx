import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import SearchResults from './SearchResults';
import ProductDetail from './ProductDetail';
import Profile from './Profile';
import SellerProfile from './SellerProfile';
import Admin from './Admin';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/result" element={<SearchResults />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/seller-profile" element={<SellerProfile />} />
        <Route path="/seller-profile/:id" element={<SellerProfile />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}

export default App;
