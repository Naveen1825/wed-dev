import './App.css'
import { useState, useEffect } from 'react'

interface Breed {
  id: number
  name: string
  image: string
}

function App() {
  const [breeds, setBreeds] = useState<Breed[]>([])

  useEffect(() => {
    fetch('/breed.json')
      .then(response => response.json())
      .then(data => setBreeds(data))
      .catch(error => console.error('Error loading breed data:', error))
  }, [])

  const scrollLeft = () => {
    const container = document.getElementById('breed-scroll')
    if (container) {
      container.scrollBy({ left: -200, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    const container = document.getElementById('breed-scroll')
    if (container) {
      container.scrollBy({ left: 200, behavior: 'smooth' })
    }
  }

  return (
    <>
      {/* Navigation Section */}
      <section className="Navigation">
        <div className="nav-container">
          <img src="https://anisell.in/wp-content/uploads/2025/06/91-93450-29589-1.png" alt="Logo" className="logo"/>
          <div className="search-container">
            <input type="text" placeholder="Search" />
            <button type="button" className="search-button">search</button>
          </div>
          <div className="user-container">
            {/* <img src="/user-profile.png" alt="User" className="user-image"/> */}
            <button>Sign in / Up</button>
          </div>
        </div>
      </section>

      {/* Breed Browser Section */}
      <section className="breed-browser">
        <div className="breed-browser-container">
          <button className="scroll-arrow scroll-left" onClick={scrollLeft}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          
          <div className="breed-scroll-container">
            <div id="breed-scroll" className="breed-scroll">
              {breeds.map((breed) => (
                <div key={breed.id} className="breed-card">
                  <div className='img-container'>
                    <img src={breed.image} alt={breed.name} className="breed-image" />
                  </div>
                  <h3 className="breed-name">{breed.name}</h3>
                </div>
              ))}
            </div>
          </div>

          <button className="scroll-arrow scroll-right" onClick={scrollRight}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </section>
    </>
  )
}

export default App
