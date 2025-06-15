import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './signup.css';

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',  // Changed from fullName to match backend
    email: '',
    country: '',
    phone: '',
    password: '',
    terms_accepted: false  // Changed from terms to match backend
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)  // Now matches backend structure exactly
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }

      const data = await response.json();
      console.log('Registration successful:', data);
      navigate('/login');  // Redirect to login after successful registration
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <nav className="navbar">
        <div className="nav-logo">
          <Link to="/">Fix my Code</Link>
        </div>
        <div className="nav-links">
          <Link to="/login">Login</Link>
          <Link to="/">Home</Link>
          <Link to="#">About</Link>
        </div>
      </nav>

      <div className="main-container">
        <div className="signup-card">
          <h2>Registration Form</h2>
          {error && <div className="error-message">{error}</div>}
          
          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="input-group">
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="input-group">
              <input
                type="text"
                id="country"
                name="country"
                placeholder="Country"
                value={formData.country}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="input-group">
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="Phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            
            <div className="input-group">
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
              />
            </div>
            
            <div className="input-group terms">
              <input
                type="checkbox"
                id="terms_accepted"
                name="terms_accepted"
                checked={formData.terms_accepted}
                onChange={handleChange}
                required
              />
              <label htmlFor="terms_accepted">
                I agree to the <Link to="#">terms and conditions</Link>
              </label>
            </div>
            
            <button 
              type="submit" 
              className="action-button create-account-button"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'CREATE ACCOUNT'}
            </button>
          </form>
          
          <p className="login-redirect">
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;