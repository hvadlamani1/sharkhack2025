// Get all sections
const sections = {
    guestHome: document.getElementById('guestHomeSection'),
    farmerHome: document.getElementById('farmerHomeSection'),
    consumerHome: document.getElementById('consumerHomeSection'),
    login: document.getElementById('loginSection'),
    register: document.getElementById('registerSection'),
    farmerDashboard: document.getElementById('farmerDashboard'),
    consumerDashboard: document.getElementById('consumerDashboard')
};

// Hide all sections
function hideAllSections() {
    Object.values(sections).forEach(section => {
        section.classList.add('hidden');
    });
}

// Show specific section
function showSection(sectionId) {
    hideAllSections();
    sections[sectionId].classList.remove('hidden');
}

// Navigation function
function navigateTo(page, userType = null, filters = null) {
    if (page === 'register' && userType) {
        document.getElementById('userType').value = userType;
    }
    
    if (page === 'dashboard') {
        const type = getUserType();
        if (type === 'farmer') {
            showFarmerDashboard();
        } else {
            showConsumerDashboard(filters);
        }
        return;
    }

    if (page === 'home') {
        if (!isLoggedIn()) {
            showSection('guestHome');
        } else {
            const type = getUserType();
            if (type === 'farmer') {
                showFarmerHome();
            } else {
                showConsumerHome();
            }
        }
        return;
    }
    
    showSection(page);
}

// Show farmer home
async function showFarmerHome() {
    if (!isLoggedIn()) {
        navigateTo('login');
        return;
    }

    showSection('farmerHome');
    const user = JSON.parse(localStorage.getItem('user'));
    document.getElementById('farmerName').textContent = user.name;

    try {
        // Get farmer's listings
        const response = await authenticatedFetch('http://localhost:3000/api/produce/farmer/my-listings');
        const listings = await response.json();
        document.getElementById('listingsCount').textContent = `${listings.length} Active Listings`;

        // Show recent activity
        const recentListings = listings.slice(0, 3);
        document.getElementById('recentActivity').innerHTML = recentListings.map(listing => `
            <div class="activity-item">
                <p>${listing.produceType} - ${listing.amount}${listing.measurement}</p>
                <small>Price: $${listing.pricePerMeasurement}/${listing.measurement}</small>
            </div>
        `).join('') || 'No recent activity';
    } catch (error) {
        console.error('Error loading farmer home:', error);
    }
}

// Show consumer home
async function showConsumerHome() {
    if (!isLoggedIn()) {
        navigateTo('login');
        return;
    }

    showSection('consumerHome');
    const user = JSON.parse(localStorage.getItem('user'));
    document.getElementById('consumerName').textContent = user.name;

    try {
        // Get available produce count and featured items
        const response = await fetch('http://localhost:3000/api/produce');
        const data = await response.json();
        document.getElementById('availableCount').textContent = `${data.produces.length} Items Available`;

        // Show featured items (newest listings)
        const featuredItems = data.produces.slice(0, 3);
        document.getElementById('featuredItems').innerHTML = featuredItems.map(item => `
            <div class="featured-item">
                <p>${item.produceType} - Grade ${item.grade}</p>
                <small>$${item.pricePerMeasurement}/${item.measurement} by ${item.farmer.name}</small>
            </div>
        `).join('') || 'No featured items';
    } catch (error) {
        console.error('Error loading consumer home:', error);
    }
}

// Show farmer dashboard
function showFarmerDashboard() {
    if (!isLoggedIn()) {
        navigateTo('login');
        return;
    }
    showSection('farmerDashboard');
    loadFarmerListings();
}

// Show consumer dashboard
function showConsumerDashboard(filters = null) {
    if (!isLoggedIn()) {
        navigateTo('login');
        return;
    }
    showSection('consumerDashboard');
    
    // Apply filters if provided
    if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
            const element = document.getElementById(`${key}Filter`);
            if (element) {
                element.value = value;
            }
        });
    }
    
    loadAvailableProduce();
}

// Event Listeners
document.getElementById('homeLink').addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('home');
});

document.getElementById('loginLink').addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('login');
});

document.getElementById('registerLink').addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('register');
});

document.getElementById('dashboardLink').addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('dashboard');
});
