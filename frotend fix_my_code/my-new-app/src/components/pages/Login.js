import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './signup.css';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const formDataObj = new URLSearchParams();
      formDataObj.append('username', formData.email);
      formDataObj.append('password', formData.password);

      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formDataObj
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      console.log('Login successful');
      navigate('/code-fix');
    } catch (error) {
      setError(error.message);
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <nav className="navbar">
        <div className="nav-logo">
          <Link to="/">Fix My Code</Link>
        </div>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/signup">Sign Up</Link>
        </div>
      </nav>

      <div className="main-container">
        <div className="signup-card">
          <h2>Login</h2>
          {error && <div className="error-message">{error}</div>}
          <form className="signup-form" onSubmit={handleSubmit}>
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
                type="password"
                id="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <button 
              type="submit" 
              className="action-button create-account-button"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'LOGIN'}
            </button>
          </form>
          <p className="login-redirect">
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;