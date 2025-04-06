// WebSocket connection for real-time updates
const socket = io('http://localhost:3000', {
    auth: {
        token: () => localStorage.getItem('token')
    }
});

// Event handlers
const handlers = {
    'inventory-update': [],
    'order-status': [],
    'delivery-update': [],
    'price-alert': []
};

// Subscribe to events
export function subscribeToEvent(event, callback) {
    if (!handlers[event]) {
        handlers[event] = [];
    }
    handlers[event].push(callback);
}

// Unsubscribe from events
export function unsubscribeFromEvent(event, callback) {
    if (handlers[event]) {
        handlers[event] = handlers[event].filter(cb => cb !== callback);
    }
}

// Initialize WebSocket connection
export function initializeWebSocket() {
    // Connection events
    socket.on('connect', () => {
        console.log('Connected to real-time updates');
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from real-time updates');
    });

    // Handle inventory updates
    socket.on('inventory-update', (data) => {
        handlers['inventory-update'].forEach(callback => callback(data));
        showNotification('Inventory Update', `${data.produceType} quantity changed to ${data.newAmount} ${data.measurement}`);
    });

    // Handle order status changes
    socket.on('order-status', (data) => {
        handlers['order-status'].forEach(callback => callback(data));
        showNotification('Order Update', `Order #${data.orderId} status: ${data.status}`);
    });

    // Handle delivery updates
    socket.on('delivery-update', (data) => {
        handlers['delivery-update'].forEach(callback => callback(data));
        showNotification('Delivery Update', `Delivery #${data.deliveryId} ${data.status}`);
    });

    // Handle price alerts
    socket.on('price-alert', (data) => {
        handlers['price-alert'].forEach(callback => callback(data));
        showNotification('Price Alert', `${data.produceType} price changed to $${data.newPrice}/${data.measurement}`);
    });
}

// Show notification
function showNotification(title, message) {
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                new Notification(title, { 
                    body: message,
                    icon: '/assets/logo.svg'
                });
            }
        });
    }

    // Also show in-app notification
    const event = new CustomEvent('show-notification', {
        detail: { title, message }
    });
    window.dispatchEvent(event);
}

// Make utils globally accessible
window.WebSocketUtils = {
    socket,
    subscribeToEvent,
    unsubscribeFromEvent,
    initializeWebSocket
};
