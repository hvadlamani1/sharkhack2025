// Get all sections
const sections = {
    guestHome: document.getElementById('guestHomeSection'),
    farmerHome: document.getElementById('farmerHomeSection'),
    consumerHome: document.getElementById('consumerHomeSection'),
    login: document.getElementById('loginSection'),
    register: document.getElementById('registerSection'),
    farmerDashboard: document.getElementById('farmerDashboard'),
    consumerDashboard: document.getElementById('consumerDashboard'),
    tracking: document.getElementById('trackingSection'),
    donations: document.getElementById('donationsSection'),
    pricing: document.getElementById('pricingSection'),
    logistics: document.getElementById('logisticsSection')
};

// Hide all sections
function hideAllSections() {
    Object.values(sections).forEach(section => {
        if (section) {
            section.classList.add('hidden');
            section.classList.remove('active');
        }
    });
    
    // Also hide guest sections
    const guestSections = [
        'guestWelcomeSection',
        'guestUserTypeSection',
        'guestFeaturesSection'
    ];
    
    guestSections.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = 'none';
        }
    });
}

// Show specific section
function showSection(sectionId) {
    // First hide all sections
    hideAllSections();
    
    // Show the requested section
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.remove('hidden');
        section.classList.add('active');
    }
}

// Show registration form based on user type
function showRegistrationForm(userType) {
    // Show the registration section
    showSection('registerSection');
    
    // Set the user type
    document.getElementById('userType').value = userType;
    
    // Hide user type selection and show the form
    document.getElementById('userTypeSelection').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
    
    // Toggle appropriate fields
    const consumerFields = document.getElementById('consumerFields');
    const farmerFields = document.getElementById('farmerFields');
    
    if (userType === 'consumer') {
        consumerFields.classList.remove('hidden');
        farmerFields.classList.add('hidden');
    } else {
        consumerFields.classList.add('hidden');
        farmerFields.classList.remove('hidden');
    }
}

// Show/hide guest sections
function toggleGuestSections(show) {
    const guestSections = [
        'guestWelcomeSection',
        'guestUserTypeSection',
        'guestFeaturesSection',
        'registerSection'  // Add register section to guest sections
    ];
    
    guestSections.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = show ? 'block' : 'none';
        }
    });
}

// Navigation function
function navigateTo(page, userType = null) {
    console.log('Navigating to:', page); // Debug log
    
    // Hide all sections first
    hideAllSections();

    // Check authentication for protected pages
    const protectedPages = ['tracking', 'donations', 'pricing', 'logistics', 'dashboard'];
    const isLoggedIn = localStorage.getItem('token');
    
    if (protectedPages.includes(page) && !isLoggedIn) {
        console.log('Protected page, redirecting to login');
        showSection('loginSection');
        return;
    }

    // Handle specific page navigation
    switch (page) {
        case 'home':
            if (isLoggedIn) {
                const user = JSON.parse(localStorage.getItem('user'));
                if (user && user.type) {
                    showSection(user.type + 'Dashboard');
                } else {
                    showSection('loginSection');
                }
            } else {
                toggleGuestSections(true);
            }
            break;
            
        case 'tracking':
            console.log('Showing tracking section');
            showSection('trackingSection');
            break;
            
        case 'donations':
            showSection('donationsSection');
            break;
            
        case 'pricing':
            showSection('pricingSection');
            break;
            
        case 'logistics':
            showSection('logisticsSection');
            break;
            
        case 'login':
            if (isLoggedIn) {
                navigateTo('home');
                return;
            }
            showSection('loginSection');
            break;
            
        case 'register':
            if (isLoggedIn) {
                navigateTo('home');
                return;
            }
            showSection('registerSection');
            if (userType) {
                showRegistrationForm(userType);
            }
            break;
            
        case 'dashboard':
            if (!isLoggedIn) {
                showSection('loginSection');
                return;
            }
            const user = JSON.parse(localStorage.getItem('user'));
            if (user && user.type === 'farmer') {
                showSection('farmerDashboard');
                loadFarmerListings();
            } else {
                showSection('consumerDashboard');
                loadAvailableProduce();
            }
            break;
    }

    // Update navigation links
    updateNavigationLinks();
}

// Update navigation links based on authentication
function updateNavigationLinks() {
    const isLoggedIn = localStorage.getItem('token');
    const loginLink = document.getElementById('loginLink');
    const logoutLink = document.getElementById('logoutLink');
    const dashboardLink = document.getElementById('dashboardLink');

    if (isLoggedIn) {
        loginLink.classList.add('hidden');
        logoutLink.classList.remove('hidden');
        dashboardLink.classList.remove('hidden');
    } else {
        loginLink.classList.remove('hidden');
        logoutLink.classList.add('hidden');
        dashboardLink.classList.add('hidden');
    }
}

// Show farmer home
async function showFarmerHome() {
    if (!isLoggedIn()) {
        navigateTo('login');
        return;
    }

    showSection('farmerHomeSection');
    const user = JSON.parse(localStorage.getItem('user'));
    document.getElementById('farmerName').textContent = user.name;

    try {
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
        document.getElementById('listingsCount').textContent = '0 Active Listings';
        document.getElementById('recentActivity').innerHTML = 'No recent activity';
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
        const response = await fetch('http://localhost:3000/api/produce');
        const data = await response.json();
        document.getElementById('availableCount').textContent = `${data.produces.length} Items Available`;

        // Show featured items
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

// Initialize navigation
document.addEventListener('DOMContentLoaded', () => {
    // Set up click handlers for all navigation links
    document.querySelectorAll('[onclick^="navigateTo"]').forEach(link => {
        // Extract the navigation target from the onclick attribute
        const match = link.getAttribute('onclick').match(/navigateTo\('([^']+)'/);
        if (match) {
            const target = match[1];
            // Replace onclick with addEventListener
            link.removeAttribute('onclick');
            link.addEventListener('click', (e) => {
                e.preventDefault();
                navigateTo(target);
            });
        }
    });

    // Navigate to initial page
    const isLoggedIn = localStorage.getItem('token');
    if (isLoggedIn) {
        navigateTo('dashboard');
    } else {
        navigateTo('home');
    }
});

