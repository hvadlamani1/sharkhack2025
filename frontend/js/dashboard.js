// Dashboard tab management
function showFarmerTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('#farmerDashboard .tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('#farmerDashboard .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(`${tabName}Tab`).classList.remove('hidden');
    
    // Add active class to clicked button
    document.querySelector(`button[onclick="showFarmerTab('${tabName}')"]`).classList.add('active');
    
    // Load tab content
    if (tabName === 'history') {
        loadListingHistory();
    }
}

function showConsumerTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('#consumerDashboard .tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('#consumerDashboard .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(`${tabName}Tab`).classList.remove('hidden');
    
    // Add active class to clicked button
    document.querySelector(`button[onclick="showConsumerTab('${tabName}')"]`).classList.add('active');
    
    // Load tab content
    if (tabName === 'purchases') {
        loadPurchaseHistory();
    }
}

// Load listing history for farmers
async function loadListingHistory() {
    try {
        const response = await authenticatedFetch('http://localhost:3000/api/produce/my-listings');
        const listings = await response.json();
        
        const historyContainer = document.getElementById('listingsTab');
        
        if (listings.length === 0) {
            historyContainer.innerHTML = '<p>No listings found.</p>';
            return;
        }
        
        const listingsHTML = listings.map(listing => `
            <div class="listing-card">
                <h3>${listing.produceType}</h3>
                <p>Amount: ${listing.amount} ${listing.measurement}</p>
                <p>Price: $${listing.pricePerMeasurement} per ${listing.measurement}</p>
                <p>Grade: ${listing.grade}</p>
                <p>Status: ${listing.amount > 0 ? 'Available' : 'Sold Out'}</p>
                <p>Listed on: ${new Date(listing.createdAt).toLocaleDateString()}</p>
            </div>
        `).join('');
        
        historyContainer.innerHTML = `
            <h2>Listing History</h2>
            <div class="listings-grid">${listingsHTML}</div>
        `;
    } catch (error) {
        console.error('Load listing history error:', error);
    }
}

// Load purchase history for consumers
async function loadPurchaseHistory() {
    try {
        const response = await authenticatedFetch('http://localhost:3000/api/orders/my-orders');
        const orders = await response.json();
        
        const purchasesContainer = document.getElementById('myPurchases');
        const totalPurchasesElement = document.getElementById('totalPurchases');
        const totalSpentElement = document.getElementById('totalSpent');
        
        if (orders.length === 0) {
            purchasesContainer.innerHTML = '<p>No purchases found.</p>';
            totalPurchasesElement.textContent = '0';
            totalSpentElement.textContent = '$0.00';
            return;
        }
        
        // Calculate totals
        const totalSpent = orders.reduce((sum, order) => sum + order.totalPrice, 0);
        totalPurchasesElement.textContent = orders.length;
        totalSpentElement.textContent = `$${totalSpent.toFixed(2)}`;
        
        const ordersHTML = orders.map(order => `
            <div class="order-card">
                <h3>${order.produce.produceType}</h3>
                <p>Quantity: ${order.quantity} ${order.produce.measurement}</p>
                <p>Total Price: $${order.totalPrice.toFixed(2)}</p>
                <p>Purchased on: ${new Date(order.createdAt).toLocaleDateString()}</p>
                <p>Farmer: ${order.farmer.name}</p>
                <p>Contact: ${order.farmer.email}</p>
            </div>
        `).join('');
        
        purchasesContainer.innerHTML = ordersHTML;
    } catch (error) {
        console.error('Load purchase history error:', error);
    }
}
