import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { showNotification } = useNotifications();
  const isLoggedIn = !!localStorage.getItem('token');
  const userType = localStorage.getItem('userType');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    showNotification('Success', 'You have been logged out successfully', 'success');
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src="/assets/logo.svg" alt="SmartFarm Logo" className="h-8 w-8" />
            <span className="text-xl font-bold text-primary">SmartFarm</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-600 hover:text-primary">Home</Link>
            {isLoggedIn ? (
              <>
                <Link 
                  to={userType === 'farmer' ? '/farmer/dashboard' : '/consumer/dashboard'} 
                  className="text-gray-600 hover:text-primary"
                >
                  Dashboard
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-primary"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/farmer/register" className="btn-primary">I'm a Farmer</Link>
                <Link to="/consumer/register" className="btn-secondary">I'm a Consumer</Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              className="h-6 w-6 text-gray-500"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="text-gray-600 hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              {isLoggedIn ? (
                <>
                  <Link 
                    to={userType === 'farmer' ? '/farmer/dashboard' : '/consumer/dashboard'} 
                    className="text-gray-600 hover:text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button 
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="text-gray-600 hover:text-primary text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/farmer/register" 
                    className="btn-primary text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    I'm a Farmer
                  </Link>
                  <Link 
                    to="/consumer/register" 
                    className="btn-secondary text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    I'm a Consumer
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
