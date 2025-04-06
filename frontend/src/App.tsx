import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import FarmerDashboard from './components/FarmerDashboard';
import ConsumerDashboard from './components/ConsumerDashboard';
import { NotificationProvider } from './context/NotificationContext';
import { WebSocketProvider } from './context/WebSocketContext';

const App: React.FC = () => {
  return (
    <Router>
      <WebSocketProvider>
        <NotificationProvider>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/farmer/*" element={<FarmerDashboard />} />
              <Route path="/consumer/*" element={<ConsumerDashboard />} />
            </Routes>
          </div>
        </NotificationProvider>
      </WebSocketProvider>
    </Router>
  );
};

export default App;
