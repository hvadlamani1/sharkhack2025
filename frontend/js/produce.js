// API calls with authentication
async function authenticatedFetch(url, options = {}) {
    const token = localStorage.getItem('token');
    return fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
}

// Add new produce listing
async function addProduce(produceData) {
    try {
        const response = await authenticatedFetch('http://localhost:3000/api/produce', {
            method: 'POST',
            body: JSON.stringify(produceData)
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to add produce');
        }

        await loadFarmerListings(); // Refresh the listings
        return data;
    } catch (error) {
        console.error('Add produce error:', error);
        throw error;
    }
}

// Load farmer's own listings
async function loadFarmerListings() {
    try {
        const response = await authenticatedFetch('http://localhost:3000/api/produce/farmer/my-listings');
        const listings = await response.json();
        
        const listingsContainer = document.getElementById('produceListings');
        listingsContainer.innerHTML = listings.map(produce => `
            <div class="produce-card" data-id="${produce._id}">
                <h3>${produce.produceType}</h3>
                <div class="produce-info">Amount: ${produce.amount} ${produce.measurement}</div>
                <div class="produce-info">Grade: ${produce.grade}</div>
                <div class="produce-info">Location: ${produce.location}</div>
                <div class="produce-info">Price: $${produce.pricePerMeasurement} per ${produce.measurement}</div>
                <button onclick="deleteProduce('${produce._id}')" class="delete-btn">Delete</button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Load farmer listings error:', error);
    }
}

// Load all available produce for consumers
async function loadAvailableProduce() {
    try {
        const response = await fetch('http://localhost:3000/api/produce');
        const produces = await response.json();
        
        const produceGrid = document.getElementById('availableProduce');
        produceGrid.innerHTML = produces.map(produce => `
            <div class="produce-card">
                <h3>${produce.produceType}</h3>
                <div class="produce-info">Amount: ${produce.amount} ${produce.measurement}</div>
                <div class="produce-info">Grade: ${produce.grade}</div>
                <div class="produce-info">Location: ${produce.location}</div>
                <div class="produce-info">Price: $${produce.pricePerMeasurement} per ${produce.measurement}</div>
                <div class="produce-info">Farmer: ${produce.farmer.name}</div>
                <div class="produce-info">Contact: ${produce.farmer.email}</div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Load available produce error:', error);
    }
}

// Delete a produce listing
async function deleteProduce(produceId) {
    try {
        const response = await authenticatedFetch(`http://localhost:3000/api/produce/${produceId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Failed to delete produce');
        }

        await loadFarmerListings(); // Refresh the listings
    } catch (error) {
        console.error('Delete produce error:', error);
        alert(error.message);
    }
}

// Event Listeners
document.getElementById('produceForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const produceData = {
            produceType: document.getElementById('produceType').value,
            amount: Number(document.getElementById('amount').value),
            measurement: document.getElementById('measurement').value,
            grade: document.getElementById('grade').value,
            location: document.getElementById('location').value,
            pricePerMeasurement: Number(document.getElementById('price').value)
        };

        await addProduce(produceData);
        e.target.reset(); // Clear the form
    } catch (error) {
        alert(error.message);
    }
});
