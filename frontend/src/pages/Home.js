import React from 'react';

const Home = () => {
  return (
    <div className="home">
      <h1>Welcome to Our Platform</h1>
      <div className="user-categories">
        <div className="category-card">
          <h2>Farmer</h2>
          <p>List and sell your fresh produce directly to consumers</p>
          <button>Get Started</button>
        </div>
        <div className="category-card">
          <h2>Consumer</h2>
          <p>Buy fresh, local produce directly from farmers</p>
          <button>Get Started</button>
        </div>
      </div>
    </div>
  );
};

export default Home;
