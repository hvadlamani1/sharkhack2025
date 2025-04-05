import React from 'react';

const Home = () => {
  return (
    <div className="home">
      <h1>Welcome to Our Platform</h1>
      <div className="user-categories">
        <div className="category-card">
          <h2>User Category 1</h2>
          <p>Description for first user category</p>
          <button>Get Started</button>
        </div>
        <div className="category-card">
          <h2>User Category 2</h2>
          <p>Description for second user category</p>
          <button>Get Started</button>
        </div>
      </div>
    </div>
  );
};

export default Home;
