import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import { useNotifications } from '../context/NotificationContext';

interface Produce {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
  status: 'available' | 'low' | 'out_of_stock';
}

interface Order {
  id: string;
  customer: string;
  items: Array<{
    produceId: string;
    name: string;
    quantity: number;
    unit: string;
  }>;
  status: 'pending' | 'confirmed' | 'in_transit' | 'delivered';
  total: number;
  createdAt: string;
}

const FarmerDashboard: React.FC = () => {
  const [inventory, setInventory] = useState<Produce[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({
    totalSales: 0,
    activeOrders: 0,
    totalDonations: 0
  });

  const { socket } = useWebSocket();
  const { showNotification } = useNotifications();

  useEffect(() => {
    // Fetch initial data
    fetchInventory();
    fetchOrders();
    fetchStats();

    // Set up real-time updates
    if (socket) {
      socket.on('inventory-update', handleInventoryUpdate);
      socket.on('order-update', handleOrderUpdate);
      socket.on('donation-made', handleDonationUpdate);

      return () => {
        socket.off('inventory-update');
        socket.off('order-update');
        socket.off('donation-made');
      };
    }
  }, [socket]);

  const fetchInventory = async () => {
    try {
      const response = await fetch('/api/farmer/inventory');
      const data = await response.json();
      setInventory(data);
    } catch (error) {
      showNotification('Error', 'Failed to fetch inventory', 'error');
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/farmer/orders');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      showNotification('Error', 'Failed to fetch orders', 'error');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/farmer/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      showNotification('Error', 'Failed to fetch statistics', 'error');
    }
  };

  const handleInventoryUpdate = (data: Produce) => {
    setInventory(prev => prev.map(item => 
      item.id === data.id ? { ...item, ...data } : item
    ));
    showNotification('Inventory Update', `${data.name} quantity updated to ${data.quantity} ${data.unit}`, 'info');
  };

  const handleOrderUpdate = (data: Order) => {
    setOrders(prev => prev.map(order => 
      order.id === data.id ? { ...order, ...data } : order
    ));
    showNotification('Order Update', `Order #${data.id} status: ${data.status}`, 'info');
  };

  const handleDonationUpdate = (data: { amount: number, produce: string }) => {
    setStats(prev => ({
      ...prev,
      totalDonations: prev.totalDonations + data.amount
    }));
    showNotification('Donation Made', `${data.amount} ${data.produce} donated successfully`, 'success');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Total Sales</h3>
          <p className="text-3xl font-bold text-primary">${stats.totalSales}</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Active Orders</h3>
          <p className="text-3xl font-bold text-secondary">{stats.activeOrders}</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Total Donations</h3>
          <p className="text-3xl font-bold text-accent">{stats.totalDonations} items</p>
        </div>
      </div>

      {/* Inventory Management */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Inventory Management</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">Product</th>
                <th className="px-4 py-2 text-left">Quantity</th>
                <th className="px-4 py-2 text-left">Price</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(item => (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-2">{item.name}</td>
                  <td className="px-4 py-2">{item.quantity} {item.unit}</td>
                  <td className="px-4 py-2">${item.price}</td>
                  <td className="px-4 py-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${item.status === 'available' ? 'bg-green-100 text-green-800' :
                        item.status === 'low' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'}`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recent Orders */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Recent Orders</h2>
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="card">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">Order #{order.id}</h3>
                  <p className="text-sm text-gray-600">Customer: {order.customer}</p>
                  <div className="mt-2">
                    {order.items.map((item, index) => (
                      <p key={index} className="text-sm">
                        {item.quantity} {item.unit} {item.name}
                      </p>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${order.total}</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'confirmed' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'}`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default FarmerDashboard;
