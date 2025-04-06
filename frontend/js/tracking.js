// Sample tracking data
const trackingData = [
    {
        orderId: "ORD-2024-001",
        produce: "Organic Tomatoes",
        quantity: "500 kg",
        from: "Green Valley Farm, CA",
        to: "Fresh Market, SF",
        status: "In Transit",
        eta: "1.5 hours"
    },
    {
        orderId: "ORD-2024-002",
        produce: "Fresh Lettuce",
        quantity: "300 kg",
        from: "Sunshine Farms, OR",
        to: "Whole Foods, LA",
        status: "Loading",
        eta: "4 hours"
    },
    {
        orderId: "ORD-2024-003",
        produce: "Apples",
        quantity: "800 kg",
        from: "Mountain Orchards, WA",
        to: "Local Market, SD",
        status: "Delivered",
        eta: "Completed"
    }
];

// Function to update tracking table
function updateTrackingTable() {
    const trackingBody = document.getElementById('liveTrackingBody');
    if (!trackingBody) return;

    trackingBody.innerHTML = trackingData.map(order => `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">${order.orderId}</div>
                <div class="text-sm text-gray-500">${order.quantity}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${order.produce}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${order.from}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${order.to}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${getStatusColor(order.status)}">
                    ${order.status}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${order.eta}
            </td>
        </tr>
    `).join('');
}

// Function to get status color
function getStatusColor(status) {
    switch (status.toLowerCase()) {
        case 'in transit':
            return 'bg-yellow-100 text-yellow-800';
        case 'loading':
            return 'bg-blue-100 text-blue-800';
        case 'delivered':
            return 'bg-green-100 text-green-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

// Function to simulate real-time updates
function simulateRealTimeUpdates() {
    // Update temperatures
    const temperatures = [4, 8, 5];
    const trucks = ['Vegetables', 'Fruits', 'Mixed'];
    
    trucks.forEach((type, index) => {
        // Simulate temperature fluctuation
        temperatures[index] += (Math.random() - 0.5);
        const temp = temperatures[index].toFixed(1);
        const tempElement = document.querySelector(`span:contains("Truck #${index + 1}")`).nextElementSibling;
        if (tempElement) {
            tempElement.textContent = `${temp}°C`;
            
            // Update color based on temperature
            if (temp > 7) {
                tempElement.className = 'text-yellow-600 font-semibold';
            } else if (temp > 9) {
                tempElement.className = 'text-red-600 font-semibold';
            } else {
                tempElement.className = 'text-green-600 font-semibold';
            }
        }
    });

    // Update ETA times
    trackingData.forEach(order => {
        if (order.status === 'In Transit') {
            const etaHours = parseFloat(order.eta);
            if (etaHours > 0) {
                order.eta = `${(etaHours - 0.1).toFixed(1)} hours`;
            }
        }
    });

    // Update tracking table
    updateTrackingTable();
}

// Initialize tracking functionality
function initializeTracking() {
    // Set up WebSocket connection for real-time updates
    const socket = new WebSocket('ws://localhost:3000');
    
    socket.onmessage = function(event) {
        const data = JSON.parse(event.data);
        updateTrackingData(data);
    };

    // Initial load of tracking data
    loadTrackingData();
}

// Load initial tracking data
async function loadTrackingData() {
    try {
        const response = await fetch('http://localhost:3000/api/tracking');
        const data = await response.json();
        updateTrackingData(data);
    } catch (error) {
        console.error('Error loading tracking data:', error);
    }
}

// Update tracking data in the UI
function updateTrackingData(data) {
    const trackingBody = document.getElementById('liveTrackingBody');
    if (!trackingBody) return;

    trackingBody.innerHTML = data.shipments.map(shipment => `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap">${shipment.orderId}</td>
            <td class="px-6 py-4 whitespace-nowrap">${shipment.produce}</td>
            <td class="px-6 py-4 whitespace-nowrap">${shipment.from}</td>
            <td class="px-6 py-4 whitespace-nowrap">${shipment.to}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs font-semibold rounded-full 
                    ${getStatusColor(shipment.status)}">
                    ${shipment.status}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">${shipment.eta}</td>
        </tr>
    `).join('');
}

// Initialize when the tracking section becomes visible
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.target.id === 'trackingSection' && 
            !mutation.target.classList.contains('hidden')) {
            initializeTracking();
        }
    });
});

observer.observe(document.getElementById('trackingSection'), {
    attributes: true,
    attributeFilter: ['class']
}); 