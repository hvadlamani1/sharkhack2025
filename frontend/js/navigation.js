// Get all sections
const sections = {
    home: document.getElementById('homeSection'),
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
function navigateTo(page, userType = null) {
    if (page === 'register' && userType) {
        document.getElementById('userType').value = userType;
    }
    
    if (page === 'dashboard') {
        const type = getUserType();
        if (type === 'farmer') {
            showFarmerDashboard();
        } else {
            showConsumerDashboard();
        }
        return;
    }
    
    showSection(page);
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
function showConsumerDashboard() {
    if (!isLoggedIn()) {
        navigateTo('login');
        return;
    }
    showSection('consumerDashboard');
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
