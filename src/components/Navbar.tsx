import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="nav">
      <Link to="/">
        <img
          src="https://anisell.in/wp-content/uploads/2025/06/91-93450-29589-1.png"
          alt="logo"
          className="logo"
        />
      </Link>

      <div className="search">
        <input type="text" placeholder="Search" />
        <Link to="/result">
          <button>Search</button>
        </Link>
      </div>
      
      <img
        src="/user-profile.png"
        alt="user-profile"
        className="user-profile"

        style={
          {
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            cursor: "pointer",
            border: "1px solid #000000ff",
          }
        }
      />
      {/* <button className="login-btn">Sign in / Up</button> */}
    </nav>
  );
};

export default Navbar;
