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
    if (!trackingBody) {
        console.error('Tracking table body not found');
        return;
    }

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
    const trucks = [
        { type: 'Vegetables', temp: 4 },
        { type: 'Fruits', temp: 8 },
        { type: 'Mixed', temp: 5 }
    ];
    
    trucks.forEach((truck, index) => {
        // Simulate temperature fluctuation
        truck.temp += (Math.random() - 0.5);
        const temp = truck.temp.toFixed(1);
        
        // Update temperature display
        const tempDisplay = document.querySelector(`#truck${index + 1}Temp`);
        if (tempDisplay) {
            tempDisplay.textContent = `${temp}°C`;
            
            // Update color based on temperature
            if (parseFloat(temp) > 8) {
                tempDisplay.className = 'text-red-600 font-semibold';
            } else if (parseFloat(temp) > 6) {
                tempDisplay.className = 'text-yellow-600 font-semibold';
            } else {
                tempDisplay.className = 'text-green-600 font-semibold';
            }
        }
    });

    // Update ETA times
    trackingData.forEach(order => {
        if (order.status === 'In Transit') {
            const etaHours = parseFloat(order.eta);
            if (!isNaN(etaHours) && etaHours > 0) {
                order.eta = `${(etaHours - 0.1).toFixed(1)} hours`;
            }
        }
    });

    // Update tracking table
    updateTrackingTable();
}

// Initialize tracking functionality
function initializeTracking() {
    console.log('Initializing tracking...');
    
    try {
        // Initial update of tracking table
        updateTrackingTable();
        
        // Set up temperature displays
        const trucks = ['Vegetables', 'Fruits', 'Mixed'];
        trucks.forEach((type, index) => {
            const tempDisplay = document.createElement('span');
            tempDisplay.id = `truck${index + 1}Temp`;
            tempDisplay.className = 'text-green-600 font-semibold';
            tempDisplay.textContent = '5.0°C';
            
            const truckRow = document.querySelector(`div.space-y-4 div:nth-child(${index + 1})`);
            if (truckRow) {
                const tempSpan = truckRow.querySelector('span:nth-child(2)');
                if (tempSpan) {
                    tempSpan.replaceWith(tempDisplay);
                }
            }
        });
        
        // Start real-time updates
        setInterval(simulateRealTimeUpdates, 5000);
        
        // Try to connect to WebSocket for live updates
        try {
            const socket = new WebSocket('ws://localhost:3000');
            
            socket.onopen = () => {
                console.log('WebSocket connected');
            };
            
            socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.shipments) {
                        trackingData.length = 0;
                        trackingData.push(...data.shipments);
                        updateTrackingTable();
                    }
                } catch (error) {
                    console.error('Error processing WebSocket message:', error);
                }
            };
            
            socket.onerror = (error) => {
                console.error('WebSocket error:', error);
            };
        } catch (error) {
            console.error('Error setting up WebSocket:', error);
        }
        
    } catch (error) {
        console.error('Error in tracking initialization:', error);
    }
}

// Initialize tracking when the section becomes visible
document.addEventListener('DOMContentLoaded', () => {
    const trackingSection = document.getElementById('trackingSection');
    if (!trackingSection) {
        console.error('Tracking section not found');
        return;
    }
    
    // Create a mutation observer to watch for visibility changes
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && 
                mutation.attributeName === 'class' &&
                !trackingSection.classList.contains('hidden')) {
                console.log('Tracking section became visible');
                initializeTracking();
            }
        });
    });
    
    // Start observing
    observer.observe(trackingSection, {
        attributes: true,
        attributeFilter: ['class']
    });
    
    // Check if tracking section is already visible
    if (!trackingSection.classList.contains('hidden')) {
        console.log('Tracking section is initially visible');
        initializeTracking();
    }
}); 