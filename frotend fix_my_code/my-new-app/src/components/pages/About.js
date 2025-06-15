import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const About = () => {
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
          <h1>About Fix My Code</h1>
          <p className="hero-text">
            Fix My Code is an innovative AI-powered platform designed to help developers identify and fix code issues efficiently.
            Our advanced algorithms analyze your code and provide intelligent suggestions for improvements.
          </p>
          
          <div className="features">
            <div className="feature-item">
              <h3>🔍 Our Features</h3>
              <ul className="feature-list">
                <li>Instant code analysis</li>
                <li>Smart error detection</li>
                <li>Automated fix suggestions</li>
                <li>Multiple programming language support</li>
                <li>Real-time collaboration tools</li>
              </ul>
            </div>
            
            <div className="feature-item">
              <h3>🌟 Our Mission</h3>
              <p>
                We're committed to making code debugging and optimization accessible to developers of all skill levels.
                Our goal is to streamline the development process and help you write better, more efficient code.
              </p>
            </div>
            
            <div className="feature-item">
              <h3>🚀 Why Choose Us?</h3>
              <p>
                Unlike other tools, we provide detailed explanations with each fix, helping you learn and grow as a developer.
                Our platform is designed to be intuitive while still offering powerful features for experienced coders.
              </p>
            </div>
          </div>
          
          <Link to="/signup" className="cta-button">Start Fixing Your Code Today</Link>
        </div>
      </div>
    </div>
  );
};

export default About;