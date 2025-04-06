import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import { useNotifications } from '../context/NotificationContext';

interface Product {
  id: string;
  name: string;
  farmer: string;
  quantity: number;
  unit: string;
  price: number;
  distance: number;
}

interface Order {
  id: string;
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    unit: string;
    price: number;
  }>;
  status: 'pending' | 'confirmed' | 'in_transit' | 'delivered';
  total: number;
  estimatedDelivery: string;
  trackingInfo?: {
    currentLocation: string;
    status: string;
    updatedAt: string;
  };
}

const ConsumerDashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<{
    [key: string]: { quantity: number; product: Product };
  }>({});

  const { socket } = useWebSocket();
  const { showNotification } = useNotifications();

  useEffect(() => {
    // Fetch initial data
    fetchProducts();
    fetchOrders();

    // Set up real-time updates
    if (socket) {
      socket.on('product-update', handleProductUpdate);
      socket.on('order-update', handleOrderUpdate);
      socket.on('delivery-update', handleDeliveryUpdate);

      return () => {
        socket.off('product-update');
        socket.off('order-update');
        socket.off('delivery-update');
      };
    }
  }, [socket]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/consumer/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      showNotification('Error', 'Failed to fetch products', 'error');
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/consumer/orders');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      showNotification('Error', 'Failed to fetch orders', 'error');
    }
  };

  const handleProductUpdate = (data: Product) => {
    setProducts(prev => prev.map(product => 
      product.id === data.id ? { ...product, ...data } : product
    ));
    showNotification('Product Update', `${data.name} has been updated`, 'info');
  };

  const handleOrderUpdate = (data: Order) => {
    setOrders(prev => prev.map(order => 
      order.id === data.id ? { ...order, ...data } : order
    ));
    showNotification('Order Update', `Order #${data.id} status: ${data.status}`, 'info');
  };

  const handleDeliveryUpdate = (data: { orderId: string; location: string; status: string }) => {
    setOrders(prev => prev.map(order => 
      order.id === data.orderId 
        ? { 
            ...order, 
            trackingInfo: { 
              currentLocation: data.location, 
              status: data.status, 
              updatedAt: new Date().toISOString() 
            } 
          } 
        : order
    ));
    showNotification('Delivery Update', `Order #${data.orderId} is ${data.status}`, 'info');
  };

  const addToCart = (product: Product) => {
    setCart(prev => ({
      ...prev,
      [product.id]: {
        quantity: (prev[product.id]?.quantity || 0) + 1,
        product
      }
    }));
    showNotification('Success', `Added ${product.name} to cart`, 'success');
  };

  const removeFromCart = (productId: string) => {
    const newCart = { ...cart };
    delete newCart[productId];
    setCart(newCart);
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        quantity
      }
    }));
  };

  const checkout = async () => {
    try {
      const orderItems = Object.entries(cart).map(([productId, { quantity, product }]) => ({
        productId,
        quantity,
        name: product.name,
        price: product.price,
        unit: product.unit
      }));

      const response = await fetch('/api/consumer/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ items: orderItems })
      });

      const data = await response.json();
      setOrders(prev => [...prev, data]);
      setCart({});
      showNotification('Success', 'Order placed successfully', 'success');
    } catch (error) {
      showNotification('Error', 'Failed to place order', 'error');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Products Grid */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Available Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <div key={product.id} className="card">
              <h3 className="font-semibold mb-2">{product.name}</h3>
              <p className="text-sm text-gray-600">From {product.farmer}</p>
              <p className="text-sm text-gray-600">{product.distance} miles away</p>
              <div className="mt-4 flex justify-between items-center">
                <p className="font-semibold">${product.price}/{product.unit}</p>
                <button 
                  onClick={() => addToCart(product)}
                  className="btn-primary text-sm"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Shopping Cart */}
      {Object.keys(cart).length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Shopping Cart</h2>
          <div className="card">
            {Object.entries(cart).map(([productId, { quantity, product }]) => (
              <div key={productId} className="flex justify-between items-center py-2">
                <div>
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-sm text-gray-600">${product.price}/{product.unit}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => updateCartQuantity(productId, quantity - 1)}
                      className="btn-secondary text-sm px-2 py-1"
                    >
                      -
                    </button>
                    <span>{quantity}</span>
                    <button 
                      onClick={() => updateCartQuantity(productId, quantity + 1)}
                      className="btn-secondary text-sm px-2 py-1"
                    >
                      +
                    </button>
                  </div>
                  <button 
                    onClick={() => removeFromCart(productId)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <p className="font-semibold">Total:</p>
                <p className="font-semibold">
                  ${Object.entries(cart).reduce((total, [_, { quantity, product }]) => 
                    total + (quantity * product.price), 0).toFixed(2)}
                </p>
              </div>
              <button 
                onClick={checkout}
                className="btn-primary w-full mt-4"
              >
                Checkout
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Orders */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Your Orders</h2>
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="card">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">Order #{order.id}</h3>
                  <div className="mt-2">
                    {order.items.map((item, index) => (
                      <p key={index} className="text-sm">
                        {item.quantity} {item.unit} {item.name} @ ${item.price}/{item.unit}
                      </p>
                    ))}
                  </div>
                  {order.trackingInfo && (
                    <div className="mt-2 text-sm text-gray-600">
                      <p>Location: {order.trackingInfo.currentLocation}</p>
                      <p>Status: {order.trackingInfo.status}</p>
                      <p>Updated: {new Date(order.trackingInfo.updatedAt).toLocaleString()}</p>
                    </div>
                  )}
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
                  <p className="text-sm text-gray-600 mt-2">
                    Estimated Delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ConsumerDashboard;
