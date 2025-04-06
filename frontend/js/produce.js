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
        // Load both active listings and history
        const [activeResponse, historyResponse] = await Promise.all([
            authenticatedFetch('http://localhost:3000/api/produce/farmer/my-listings'),
            authenticatedFetch('http://localhost:3000/api/produce/farmer/history')
        ]);
        
        const activeListings = await activeResponse.json();
        const historyListings = await historyResponse.json();
        
        // Update active listings
        const listingsContainer = document.getElementById('produceListings');
        listingsContainer.innerHTML = activeListings.map(produce => `
            <div class="produce-card" data-id="${produce._id}">
                <h3>${produce.produceType}</h3>
                <div class="produce-info">Amount: ${produce.amount} ${produce.measurement}</div>
                <div class="produce-info">Grade: ${produce.grade}</div>
                <div class="produce-info">Location: ${produce.location}</div>
                <div class="produce-info">Price: $${produce.pricePerMeasurement} per ${produce.measurement}</div>
                <button onclick="deleteProduce('${produce._id}')" class="delete-btn">Delete</button>
            </div>
        `).join('');

        // Update history listings
        const historyContainer = document.getElementById('produceHistory');
        historyContainer.innerHTML = historyListings.map(produce => `
            <div class="produce-card history-card" data-id="${produce._id}">
                <h3>${produce.produceType}</h3>
                <div class="produce-info">Original Amount: ${produce.originalAmount} ${produce.measurement}</div>
                <div class="produce-info">Grade: ${produce.grade}</div>
                <div class="produce-info">Location: ${produce.location}</div>
                <div class="produce-info">Price: $${produce.pricePerMeasurement} per ${produce.measurement}</div>
                <div class="produce-info">Deleted: ${new Date(produce.deletedAt).toLocaleDateString()}</div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Load farmer listings error:', error);
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

// Load all available produce for consumers with filters
async function loadAvailableProduce() {
  try {
    const queryString = getFilterQueryString();
    const response = await fetch(`http://localhost:3000/api/produce?${queryString}`);
    const { produces, filterOptions, totalCount } = await response.json();
    
    const produceGrid = document.getElementById('availableProduce');
    document.getElementById('totalCount').textContent = `${totalCount} items found`;
    
    // Update filter options if they exist
    if (filterOptions) {
      const measurementFilter = document.getElementById('measurementFilter');
      if (measurementFilter && filterOptions.measurements) {
        measurementFilter.innerHTML = '<option value="">All Measurements</option>' +
          filterOptions.measurements.map(m => `<option value="${m}">${m}</option>`).join('');
      }

      // Update price range inputs
      if (filterOptions.minPrice !== undefined && filterOptions.maxPrice !== undefined) {
        document.getElementById('minPriceFilter').min = filterOptions.minPrice;
        document.getElementById('maxPriceFilter').max = filterOptions.maxPrice;
      }
    }
    
    produceGrid.innerHTML = produces.map(produce => `
      <div class="produce-card">
        <h3>${produce.produceType}</h3>
        <div class="produce-info">Amount: ${produce.amount} ${produce.measurement}</div>
        <div class="produce-info">Grade: ${produce.grade}</div>
        <div class="produce-info">Location: ${produce.location}</div>
        <div class="produce-info">Price: $${produce.pricePerMeasurement} per ${produce.measurement}</div>
        <div class="produce-info">Farmer: ${produce.farmer.name}</div>
        <div class="produce-info">Contact: ${produce.farmer.email}</div>
        ${getUserType() === 'consumer' ? `
          <button 
                  class="purchase-btn"
                  data-produce='${JSON.stringify(produce)}'
                  ${produce.amount === 0 ? 'disabled' : ''}>
            ${produce.amount === 0 ? 'Out of Stock' : 'Purchase'}
          </button>
        ` : ''}
      </div>
    `).join('');
  } catch (error) {
    console.error('Load available produce error:', error);
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
    try {
        const response = await authenticatedFetch(`http://localhost:3000/api/produce/${produceId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Failed to delete produce');
        }

        await loadFarmerListings(); // Refresh both active listings and history
    } catch (error) {
        console.error('Delete produce error:', error);
        alert(error.message);
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
