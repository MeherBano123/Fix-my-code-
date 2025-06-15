import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div>
      <nav className="navbar">
        <div className="nav-logo">
          <Link to="/">Fix My Code</Link>
        </div>
        <div className="nav-links">
          <Link to="/login">Login</Link>
          <Link to="/about">About</Link>
         
        </div>
      </nav>

      <div className="main-container">
        <div className="hero-section">
          <h1>Welcome to Fix My Code</h1>
          <p className="hero-text">
            Your AI-powered coding assistant that helps you fix bugs, improve code quality,
            and learn from your mistakes. Get instant solutions to your coding problems.
          </p>
          <div className="features">
            <div className="feature-item">
              <h3>🔍 Smart Bug Detection</h3>
              <p>Advanced AI algorithms to identify and fix coding issues</p>
            </div>
            <div className="feature-item">
              <h3>⚡ Instant Solutions</h3>
              <p>Get immediate fixes for your code problems</p>
            </div>
            <div className="feature-item">
              <h3>📚 Learn & Improve</h3>
              <p>Understand the fixes with detailed explanations</p>
            </div>
          </div>
          <Link to="/signup" className="cta-button">Get Started - It's Free</Link>
        </div>
      </div>
    </div>
  );
}

export default Home;