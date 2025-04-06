// Get socket and event functions
const { socket, subscribeToEvent, unsubscribeFromEvent } = window.WebSocketUtils || {};
const notificationManager = window.NotificationManager;

class TrackingSystem {
    constructor() {
        this.activeDeliveries = new Map();
        this.initialize();
    }

    initialize() {
        // Subscribe to delivery updates
        subscribeToEvent('delivery-update', (data) => {
            this.updateDeliveryStatus(data);
        });

        // Subscribe to inventory updates
        subscribeToEvent('inventory-update', (data) => {
            this.updateInventoryDisplay(data);
        });
    }

    updateDeliveryStatus(data) {
        const { deliveryId, status, location, estimatedArrival } = data;
        
        // Update delivery card if it exists
        const deliveryCard = document.querySelector(`[data-delivery-id="${deliveryId}"]`);
        if (deliveryCard) {
            // Update status
            deliveryCard.querySelector('.delivery-status').textContent = status;
            
            // Update location if provided
            if (location) {
                deliveryCard.querySelector('.delivery-location').textContent = location;
            }

            // Update ETA if provided
            if (estimatedArrival) {
                deliveryCard.querySelector('.delivery-eta').textContent = 
                    new Date(estimatedArrival).toLocaleTimeString();
            }

            // Update status color
            const statusColors = {
                'preparing': 'bg-yellow-100 text-yellow-800',
                'in-transit': 'bg-blue-100 text-blue-800',
                'delivered': 'bg-green-100 text-green-800',
                'delayed': 'bg-red-100 text-red-800'
            };

            const statusBadge = deliveryCard.querySelector('.status-badge');
            Object.values(statusColors).forEach(color => {
                const classes = color.split(' ');
                statusBadge.classList.remove(...classes);
            });
            statusBadge.classList.add(...statusColors[status].split(' '));
        }
    }

    updateInventoryDisplay(data) {
        const { produceId, produceType, newAmount, measurement } = data;
        
        // Update inventory card if it exists
        const inventoryCard = document.querySelector(`[data-produce-id="${produceId}"]`);
        if (inventoryCard) {
            const amountDisplay = inventoryCard.querySelector('.produce-amount');
            amountDisplay.textContent = `${newAmount} ${measurement}`;

            // Add animation to highlight the change
            amountDisplay.classList.add('animate-pulse', 'bg-green-50');
            setTimeout(() => {
                amountDisplay.classList.remove('animate-pulse', 'bg-green-50');
            }, 2000);
        }
    }

    // Create a new delivery card
    createDeliveryCard(delivery) {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-lg shadow p-4 mb-4';
        card.setAttribute('data-delivery-id', delivery.id);
        
        card.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <h3 class="text-lg font-semibold">${delivery.customer}</h3>
                    <p class="text-sm text-gray-500">${delivery.items}</p>
                    <p class="text-sm text-gray-500 delivery-location">${delivery.location || 'Preparing...'}</p>
                    <p class="text-sm text-gray-500">ETA: <span class="delivery-eta">${
                        delivery.estimatedArrival ? 
                        new Date(delivery.estimatedArrival).toLocaleTimeString() : 
                        'Calculating...'
                    }</span></p>
                </div>
                <span class="status-badge px-2 py-1 rounded-full text-sm font-medium delivery-status">
                    ${delivery.status}
                </span>
            </div>
        `;

        return card;
    }

    // Initialize delivery tracking for a specific delivery
    trackDelivery(deliveryId) {
        socket.emit('track-delivery', { deliveryId });
    }

    // Stop tracking a delivery
    stopTracking(deliveryId) {
        socket.emit('stop-tracking', { deliveryId });
    }
}

// Create and export singleton instance
const trackingSystem = new TrackingSystem();
export default trackingSystem;
