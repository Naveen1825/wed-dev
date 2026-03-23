import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <div className="nav-wrapper">
      <nav className="nav">
        <Link to="/">
          <img
            src="https://anisell.in/wp-content/uploads/2025/06/91-93450-29589-1.png"
            alt="AniSell Logo"
            className="logo"
          />
        </Link>

        <div className="search">
          <input type="text" placeholder="Search pets, breeds, accessories..." />
          <Link to="/result">
            <button>Search</button>
          </Link>
        </div>

        <Link to="/profile">
          <img
            src="/user-profile.png"
            alt="My Profile"
            className="user-profile"
            style={{ width: '50px', height: '50px', borderRadius: '50%', cursor: 'pointer', border: '1px solid #000' }}
          />
        </Link>
        <Link to="/seller-profile">
          <button className="login-btn">Seller Store</button>
        </Link>
        <button className="login-btn">Sign in / Up</button>
      </nav>
    </div>
  );
};

export default Navbar;
