import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-accent/10 py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Connect Directly with Local Farmers
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Get fresh produce delivered straight from farms to your doorstep with real-time tracking
                and smart inventory management.
              </p>
              <div className="space-x-4">
                <Link to="/farmer/register" className="btn-primary">
                  I'm a Farmer
                </Link>
                <Link to="/consumer/register" className="btn-secondary">
                  I'm a Consumer
                </Link>
              </div>
            </div>
            <div className="md:w-1/2">
              <img src="/assets/hero-image.svg" alt="Farm to Table" className="w-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose SmartFarm?</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="card hover:shadow-lg transition-shadow">
              <div className="text-4xl text-primary mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">Real-Time Tracking</h3>
              <p className="text-gray-600">
                Monitor your produce from farm to table with live updates and notifications.
              </p>
            </div>
            <div className="card hover:shadow-lg transition-shadow">
              <div className="text-4xl text-primary mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2">Smart Donations</h3>
              <p className="text-gray-600">
                Automatically donate excess produce to local food banks and track your impact.
              </p>
            </div>
            <div className="card hover:shadow-lg transition-shadow">
              <div className="text-4xl text-primary mb-4">💰</div>
              <h3 className="text-xl font-semibold mb-2">Fair Prices</h3>
              <p className="text-gray-600">
                Dynamic pricing ensures farmers get fair value and consumers get great deals.
              </p>
            </div>
            <div className="card hover:shadow-lg transition-shadow">
              <div className="text-4xl text-primary mb-4">🚛</div>
              <h3 className="text-xl font-semibold mb-2">Smart Logistics</h3>
              <p className="text-gray-600">
                Optimized delivery routes and real-time order tracking for maximum efficiency.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
