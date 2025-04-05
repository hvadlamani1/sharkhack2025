// Show purchase modal
window.showPurchaseModal = function(produceJson) {
    console.log('Opening purchase modal with data:', produceJson);
    let produce;
    try {
        produce = JSON.parse(produceJson);
    } catch (error) {
        console.error('Failed to parse produce data:', error);
        alert('Error: Could not load produce details');
        return;
    }
    const modal = document.getElementById('purchaseModal');
    const form = document.getElementById('purchaseForm');
    
    // Set produce details in modal
    document.getElementById('produceId').value = produce._id;
    document.getElementById('modalProduceType').textContent = produce.produceType;
    document.getElementById('modalAvailableAmount').textContent = `${produce.amount} ${produce.measurement}`;
    document.getElementById('modalMeasurement').textContent = produce.measurement;
    document.getElementById('modalPrice').textContent = `$${produce.pricePerMeasurement}`;
    
    // Set max quantity
    const quantityInput = document.getElementById('purchaseQuantity');
    quantityInput.max = produce.amount;
    quantityInput.value = 1;
    
    // Update total price on quantity change
    const updateTotalPrice = () => {
        const quantity = parseFloat(quantityInput.value) || 0;
        const totalPrice = quantity * produce.pricePerMeasurement;
        document.getElementById('modalTotalPrice').textContent = `$${totalPrice.toFixed(2)}`;
        
        // Validate quantity
        if (quantity > produce.amount) {
            quantityInput.setCustomValidity(`Maximum available quantity is ${produce.amount}`);
        } else if (quantity <= 0) {
            quantityInput.setCustomValidity('Quantity must be greater than 0');
        } else {
            quantityInput.setCustomValidity('');
        }
    };
    
    quantityInput.addEventListener('input', updateTotalPrice);
    updateTotalPrice(); // Initialize total price
    
    modal.classList.remove('hidden');
}

// Close purchase modal
window.closePurchaseModal = function() {
    document.getElementById('purchaseModal').classList.add('hidden');
}

// Handle purchase form submission
window.handlePurchase = async function(event) {
    event.preventDefault();
    console.log('Handling purchase submit...');
    
    const produceId = document.getElementById('produceId').value;
    const quantity = parseFloat(document.getElementById('purchaseQuantity').value);
    
    if (!produceId) {
        console.error('No produce ID found');
        alert('Error: Could not identify the produce to purchase');
        return;
    }

    if (!quantity || quantity <= 0) {
        console.error('Invalid quantity:', quantity);
        alert('Please enter a valid quantity');
        return;
    }

    try {
        console.log('Sending purchase request:', { produceId, quantity });
        const response = await authenticatedFetch('http://localhost:3000/api/orders', {
            method: 'POST',
            body: JSON.stringify({
                produceId,
                quantity
            })
        });
        
        const order = await response.json();
        console.log('Purchase response:', order);
        
        if (response.ok) {
            closePurchaseModal();
            await loadAvailableProduce(); // Refresh produce list
            await loadMyOrders(); // Refresh orders list
            alert('Purchase successful!');
        } else {
            console.error('Purchase failed:', order);
            alert(order.message || 'Purchase failed');
        }
    } catch (error) {
        console.error('Purchase error:', error);
        alert('Purchase failed: ' + (error.message || 'Unknown error'));
    }
}

// Load user's orders
async function loadMyOrders() {
    const ordersGrid = document.getElementById('myOrders');
    
    try {
        console.log('Loading user orders...');
        const response = await authenticatedFetch('http://localhost:3000/api/orders/my-orders');
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to load orders');
        }
        
        const orders = await response.json();
        console.log('Orders loaded:', orders);
        
        if (orders.length === 0) {
            ordersGrid.innerHTML = '<div class="no-orders">No orders found</div>';
            return;
        }
        
        ordersGrid.innerHTML = orders.map(order => `
            <div class="order-card">
                <h3>${order.produce.produceType}</h3>
                <div class="order-info">
                    <p>Quantity: ${order.quantity} ${order.produce.measurement}</p>
                    <p>Total Price: $${order.totalPrice.toFixed(2)}</p>
                    <p>Status: <span class="status-${order.status.toLowerCase()}">${order.status}</span></p>
                    <p>Farmer: ${order.farmer.name}</p>
                    <p>Contact: ${order.farmer.email}</p>
                    <p>Order Date: ${new Date(order.orderDate).toLocaleString()}</p>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Load orders error:', error);
        ordersGrid.innerHTML = `<div class="error-message">Error loading orders: ${error.message}</div>`;
    }
}

// Show tab content
function showTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase().includes(tabName)) {
            btn.classList.add('active');
        }
    });
    
    // Show/hide content
    const availableTab = document.getElementById('availableTab');
    const ordersTab = document.getElementById('ordersTab');
    
    if (tabName === 'available') {
        availableTab.classList.remove('hidden');
        ordersTab.classList.add('hidden');
        loadAvailableProduce();
    } else {
        availableTab.classList.add('hidden');
        ordersTab.classList.remove('hidden');
        loadMyOrders();
    }
}
