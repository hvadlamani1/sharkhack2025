// Show Add Produce form
function showAddProduceForm() {
    console.log('Showing add produce form');
    const form = document.getElementById('addProduceForm');
    form.classList.remove('hidden');
}

// Hide Add Produce form
function hideAddProduceForm() {
    console.log('Hiding add produce form');
    const form = document.getElementById('addProduceForm');
    form.classList.add('hidden');
    document.getElementById('produceForm').reset();
    
    // Reset form title and button text
    form.querySelector('h3').textContent = 'Add New Produce';
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Add Produce';
    
    // Clear edit ID
    delete form.dataset.editId;
}

// Add new produce listing
async function addProduce(produceData) {
    console.log('Adding produce with data:', produceData);
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Not authenticated');
        }

        console.log('Using token:', token);
        
        // Transform the data to match backend model
        const transformedData = {
            produceType: produceData.name,
            amount: produceData.quantity,
            measurement: produceData.unit,
            grade: produceData.grade,
            location: produceData.location,
            pricePerMeasurement: produceData.price,
            thresholdPercentage: 20 // Default threshold
        };
        
        const response = await fetch('http://localhost:3000/api/produce', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(transformedData)
        });

        const data = await response.json();
        console.log('Server response:', data);
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to add produce');
        }

        hideAddProduceForm();
        await loadFarmerListings(); // Refresh the listings
        return data;
    } catch (error) {
        console.error('Add produce error:', error);
        throw error;
    }
}

// Fetch helper with authentication
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

// Load farmer's produce listings
async function loadFarmerListings() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Not authenticated');
        }

        console.log('Loading farmer listings...');
        const response = await fetch('http://localhost:3000/api/produce/farmer/my-listings', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Server error:', errorData);
            throw new Error(errorData.message || 'Failed to fetch listings');
        }

        const listings = await response.json();
        console.log('Fetched listings:', listings);
        
        const listingsContainer = document.getElementById('farmerListings');
        if (!listingsContainer) {
            console.error('Listings container not found');
            return;
        }

        listingsContainer.innerHTML = '';

        if (!Array.isArray(listings)) {
            console.error('Invalid response format:', listings);
            throw new Error('Invalid response format from server');
        }

        if (listings.length === 0) {
            listingsContainer.innerHTML = `
                <div class="col-span-full text-center py-8 text-gray-500">
                    <p class="text-lg">No produce listings yet.</p>
                    <button onclick="showAddProduceForm()" 
                        class="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200">
                        + Add Your First Produce
                    </button>
                </div>
            `;
            return;
        }

        listings.forEach(listing => {
            const listingElement = document.createElement('div');
            listingElement.className = 'bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:border-green-500 transition-all duration-200';
            
            const gradeClass = listing.grade === 'A' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
            
            listingElement.innerHTML = `
                <div class="relative">
                    <div class="absolute top-2 right-2">
                        <span class="px-2 py-1 rounded-full text-xs font-medium ${gradeClass}">
                            Grade ${listing.grade}
                        </span>
                    </div>
                    <div class="p-6">
                        <h3 class="text-xl font-semibold mb-2">${listing.produceType}</h3>
                        <div class="space-y-2">
                            <div class="flex justify-between items-center text-gray-600">
                                <span>Amount:</span>
                                <span class="font-medium">${listing.amount} ${listing.measurement}</span>
                            </div>
                            <div class="flex justify-between items-center text-gray-600">
                                <span>Price:</span>
                                <span class="font-medium">$${listing.pricePerMeasurement}/${listing.measurement}</span>
                            </div>
                            <div class="flex justify-between items-center text-gray-600">
                                <span>Location:</span>
                                <span class="font-medium">${listing.location}</span>
                            </div>
                        </div>
                        <div class="mt-4 flex justify-end space-x-2">
                            <button onclick="editProduce('${listing._id}')" 
                                class="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-md transition-colors duration-200">
                                Edit
                            </button>
                            <button onclick="deleteProduce('${listing._id}')"
                                class="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-600 rounded-md transition-colors duration-200">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            listingsContainer.appendChild(listingElement);
        });

    } catch (error) {
        console.error('Error loading farmer listings:', error);
        const listingsContainer = document.getElementById('farmerListings');
        if (listingsContainer) {
            listingsContainer.innerHTML = `
                <div class="col-span-full text-center py-8 text-red-500">
                    <p class="text-lg">Failed to load listings. Please try again.</p>
                    <p class="text-sm mt-2">${error.message}</p>
                </div>
            `;
        }
    }
}

// Load filter options and set up filter handlers
async function initializeFilters() {
  try {
    const response = await fetch('http://localhost:3000/api/produce/filter-options');
    const options = await response.json();
    
    // Populate measurement filter
    const measurementFilter = document.getElementById('measurementFilter');
    options.measurements.forEach(measurement => {
      const option = document.createElement('option');
      option.value = measurement;
      option.textContent = measurement;
      measurementFilter.appendChild(option);
    });

    // Set up price range
    document.getElementById('minPriceFilter').min = options.minPrice;
    document.getElementById('maxPriceFilter').max = options.maxPrice;
  } catch (error) {
    console.error('Initialize filters error:', error);
  }
}

// Build query string from filters
function getFilterQueryString() {
  const filters = {
    produceType: document.getElementById('produceTypeFilter').value,
    measurement: document.getElementById('measurementFilter').value,
    grade: document.getElementById('gradeFilter').value,
    location: document.getElementById('locationFilter').value,
    minPrice: document.getElementById('minPriceFilter').value,
    maxPrice: document.getElementById('maxPriceFilter').value,
    sortBy: document.getElementById('sortBy').value,
    sortOrder: document.getElementById('sortOrder').value
  };

  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });

  return params.toString();
}

// Filter state
let currentFilters = {
    produceType: '',
    grade: '',
    minPrice: '',
    maxPrice: '',
    availability: ''
};

// Reset filters
function resetFilters() {
    // Reset filter state
    currentFilters = {
        produceType: '',
        grade: '',
        minPrice: '',
        maxPrice: '',
        availability: ''
    };

    // Reset form inputs
    document.getElementById('produceTypeFilter').value = '';
    document.getElementById('gradeFilter').value = '';
    document.getElementById('minPrice').value = '';
    document.getElementById('maxPrice').value = '';
    document.getElementById('availabilityFilter').value = '';

    // Reload produce with no filters
    loadAvailableProduce();
}

// Apply filters
async function applyFilters() {
    // Get filter values
    currentFilters = {
        produceType: document.getElementById('produceTypeFilter').value,
        grade: document.getElementById('gradeFilter').value,
        minPrice: document.getElementById('minPrice').value,
        maxPrice: document.getElementById('maxPrice').value,
        availability: document.getElementById('availabilityFilter').value
    };

    // Load filtered produce
    await loadAvailableProduce();
}

// Load available produce with filters
async function loadAvailableProduce() {
    try {
        // Build query parameters
        const params = new URLSearchParams();
        if (currentFilters.produceType) params.append('produceType', currentFilters.produceType);
        if (currentFilters.grade) params.append('grade', currentFilters.grade);
        if (currentFilters.minPrice) params.append('minPrice', currentFilters.minPrice);
        if (currentFilters.maxPrice) params.append('maxPrice', currentFilters.maxPrice);
        if (currentFilters.availability) params.append('availability', currentFilters.availability);

        const response = await fetch(`http://localhost:3000/api/produce?${params.toString()}`);
        const data = await response.json();
        
        const produceContainer = document.getElementById('availableProduce');
        if (!produceContainer) return;

        if (data.produces.length === 0) {
            produceContainer.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-gray-600">No produce available matching your filters.</p>
                </div>
            `;
            return;
        }

        produceContainer.innerHTML = data.produces.map(produce => createProduceCard(produce)).join('');

        // Update filter options based on available produce
        updateFilterOptions(data.filterOptions);
    } catch (error) {
        console.error('Error loading available produce:', error);
        const produceContainer = document.getElementById('availableProduce');
        if (produceContainer) {
            produceContainer.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-red-600">Error loading produce. Please try again.</p>
                </div>
            `;
        }
    }
}

// Update filter options based on available produce
function updateFilterOptions(filterOptions) {
    if (!filterOptions) return;

    // Update produce type options
    const produceTypeFilter = document.getElementById('produceTypeFilter');
    const currentProduceType = produceTypeFilter.value;
    produceTypeFilter.innerHTML = `
        <option value="">All Types</option>
        ${filterOptions.produceTypes.map(type => `
            <option value="${type}" ${currentProduceType === type ? 'selected' : ''}>
                ${type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
        `).join('')}
    `;

    // Update measurement options if needed
    if (filterOptions.measurements) {
        const measurementFilter = document.getElementById('measurementFilter');
        if (measurementFilter) {
            const currentMeasurement = measurementFilter.value;
            measurementFilter.innerHTML = `
                <option value="">All Units</option>
                ${filterOptions.measurements.map(measurement => `
                    <option value="${measurement}" ${currentMeasurement === measurement ? 'selected' : ''}>
                        ${measurement.toUpperCase()}
                    </option>
                `).join('')}
            `;
        }
    }
}

// Set up filter event listeners
function setupFilterListeners() {
  const filterInputs = [
    'produceTypeFilter',
    'measurementFilter',
    'gradeFilter',
    'locationFilter',
    'minPriceFilter',
    'maxPriceFilter',
    'sortBy',
    'sortOrder'
  ];

  filterInputs.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('change', loadAvailableProduce);
      if (element.tagName === 'INPUT') {
        element.addEventListener('keyup', debounce(loadAvailableProduce, 300));
      }
    }
  });
}

// Debounce function to limit API calls
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Delete a produce listing
async function deleteProduce(produceId) {
    if (!confirm('Are you sure you want to delete this produce listing?')) {
        return;
    }
    
    try {
        const response = await fetch(`http://localhost:3000/api/produce/${produceId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete produce');
        }

        await loadFarmerListings(); // Refresh the listings
    } catch (error) {
        console.error('Delete produce error:', error);
        alert('Failed to delete produce: ' + error.message);
    }
}

// Event Listeners for purchase buttons
document.addEventListener('click', function(e) {
    if (e.target.matches('.purchase-btn') && !e.target.disabled) {
        const produceData = e.target.dataset.produce;
        showPurchaseModal(produceData);
    }
});

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    const produceForm = document.getElementById('produceForm');
    console.log('Found produce form:', produceForm);
    
    if (produceForm) {
        produceForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Form submitted');
            try {
                const form = document.getElementById('addProduceForm');
                const editId = form.dataset.editId;
                
                // Updated field names to match backend model
                const produceData = {
                    name: document.getElementById('produceType').value,
                    quantity: Number(document.getElementById('amount').value),
                    unit: document.getElementById('measurement').value,
                    grade: document.getElementById('grade').value,
                    location: document.getElementById('location').value,
                    price: Number(document.getElementById('price').value)
                };
                
                console.log('Produce data:', produceData);
                console.log('Edit ID:', editId);

                if (editId) {
                    // Update existing produce
                    console.log('Updating produce with ID:', editId);
                    const response = await fetch(`http://localhost:3000/api/produce/${editId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: JSON.stringify(produceData)
                    });
                    
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Failed to update produce');
                    }
                    
                    alert('Produce updated successfully!');
                } else {
                    // Add new produce
                    await addProduce(produceData);
                    alert('Produce added successfully!');
                }
                
                // Reset form and UI
                form.dataset.editId = ''; // Clear the edit ID
                hideAddProduceForm();
                await loadFarmerListings();
            } catch (error) {
                console.error('Form submission error:', error);
                alert(error.message || 'Failed to save produce');
            }
        });
    }
});

// Edit produce functionality
async function editProduce(produceId) {
    try {
        console.log('Editing produce with ID:', produceId);
        // Get the current produce data
        const response = await fetch(`http://localhost:3000/api/produce/${produceId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch produce details');
        }

        const produce = await response.json();
        console.log('Fetched produce data:', produce);
        
        // Fill the form with current values
        document.getElementById('produceType').value = produce.produceType;
        document.getElementById('amount').value = produce.amount;
        document.getElementById('measurement').value = produce.measurement;
        document.getElementById('grade').value = produce.grade;
        document.getElementById('location').value = produce.location;
        document.getElementById('price').value = produce.pricePerMeasurement;
        
        // Show the form
        const form = document.getElementById('addProduceForm');
        form.classList.remove('hidden');
        
        // Change form submit button text
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Update Produce';
        
        // Store the produce ID in the form
        form.dataset.editId = produceId;
        
        // Update form title
        form.querySelector('h3').textContent = 'Edit Produce';
    } catch (error) {
        console.error('Error loading produce for edit:', error);
        alert('Failed to load produce details for editing: ' + error.message);
    }
}

function createProduceCard(produce) {
    return `
        <div class="produce-listing">
            <div class="produce-info">
                <h3 class="produce-name">${produce.produceType}</h3>
                <p class="produce-farmer">Farmer: ${produce.farmer.name}</p>
                <div class="produce-details">
                    <span class="produce-detail">
                        <span>Available:</span> ${produce.amount} ${produce.measurement}
                    </span>
                    <span class="produce-detail">
                        <span class="produce-grade grade-${produce.grade.toLowerCase()}">${produce.grade}</span>
                    </span>
                </div>
            </div>
            <div class="produce-actions">
                <div class="price-tag">
                    <span class="currency">$</span>${produce.pricePerMeasurement}<span class="unit">/${produce.measurement}</span>
                </div>
                <button class="order-now-btn" onclick="orderProduce('${produce._id}')">
                    Order Now
                </button>
            </div>
        </div>
    `;
}

function displayProduceList(produceList) {
    const produceContainer = document.getElementById('produceList');
    if (!produceContainer) return;

    if (produceList.length === 0) {
        produceContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🌱</div>
                <p class="empty-state-text">No produce available matching your filters</p>
                <button class="filter-button reset-filters" onclick="resetFilters()">Reset Filters</button>
            </div>
        `;
        return;
    }

    produceContainer.innerHTML = produceList.map(produce => createProduceCard(produce)).join('');
}

function createFilterSection() {
    return `
        <div class="filter-section">
            <div class="filter-group">
                <div class="filter-item">
                    <label class="filter-label" for="produceType">Produce Type</label>
                    <select class="filter-select" id="produceType">
                        <option value="">All Types</option>
                        <option value="vegetables">Vegetables</option>
                        <option value="fruits">Fruits</option>
                        <option value="grains">Grains</option>
                    </select>
                </div>
                <div class="filter-item">
                    <label class="filter-label" for="grade">Grade</label>
                    <select class="filter-select" id="grade">
                        <option value="">All Grades</option>
                        <option value="A">Grade A</option>
                        <option value="B">Grade B</option>
                        <option value="C">Grade C</option>
                    </select>
                </div>
                <div class="filter-item">
                    <label class="filter-label" for="minPrice">Min Price</label>
                    <input type="number" class="filter-input" id="minPrice" placeholder="Min $">
                </div>
                <div class="filter-item">
                    <label class="filter-label" for="maxPrice">Max Price</label>
                    <input type="number" class="filter-input" id="maxPrice" placeholder="Max $">
                </div>
            </div>
            <div class="filter-buttons">
                <button class="filter-button apply-filters" onclick="applyFilters()">Apply Filters</button>
                <button class="filter-button reset-filters" onclick="resetFilters()">Reset</button>
            </div>
        </div>
    `;
}

async function orderProduce(produceId) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please log in to place an order');
            return;
        }

        // Get quantity from user
        const quantity = prompt('Enter quantity to order:');
        if (!quantity || isNaN(quantity) || quantity <= 0) {
            alert('Please enter a valid quantity');
            return;
        }

        const response = await fetch('http://localhost:3000/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                produceId: produceId,
                quantity: Number(quantity)
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to place order');
        }

        alert('Order placed successfully! The farmer will be notified.');
        
        // Refresh the produce listings to show updated quantities
        await loadAvailableProduce();
    } catch (error) {
        console.error('Order produce error:', error);
        alert(error.message || 'Failed to place order');
    }
}
