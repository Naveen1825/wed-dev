import "./App.css";
import { useState, useEffect, useRef } from "react";

interface Breed {
  id: number;
  name: string;
  image: string;
}

function App() {
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/breed.json")
      .then((res) => res.json())
      .then((data) => setBreeds(data))
      .catch((err) => console.error("Breed loading error:", err));
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollBy({
      left: direction === "left" ? -250 : 250,
      behavior: "smooth",
    });
  };

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
                  <img src={breed.image} alt={breed.name} />
                </div>

                <p className="breed-name">{breed.name}</p>
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
    </>
  );
}

export default App;