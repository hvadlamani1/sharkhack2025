import React from 'react';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  const handleLogout = () => {
    // TODO: Implement logout logic
    setIsLoggedIn(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">Your App Name</div>
      <ul className="nav-links">
        <li><a href="/">Home</a></li>
        {isLoggedIn ? (
          <>
            <li><a href="/dashboard">Dashboard</a></li>
            <li><a href="/profile">Profile</a></li>
            <li><button onClick={handleLogout}>Logout</button></li>
          </>
        ) : (
          <li><a href="/login">Login</a></li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
