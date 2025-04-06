// Auth state management
let currentUser = null;
let selectedLoginType = null;

// Check if user is logged in
function isLoggedIn() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return token !== null && user !== null;
}

// Get current user type
function getUserType() {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        return user ? user.userType : null;
    } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
    }
}

// Initialize auth state
function initializeAuth() {
    if (isLoggedIn()) {
        try {
            currentUser = JSON.parse(localStorage.getItem('user'));
            updateAuthUI();
            navigateToUserDashboard();
        } catch (error) {
            console.error('Error initializing auth state:', error);
            handleLogout();
        }
    } else {
        handleLogout();
    }
}

// Navigate to appropriate dashboard based on user type
function navigateToUserDashboard() {
    const userType = getUserType();
    if (userType === 'farmer') {
        showFarmerDashboard();
    } else if (userType === 'consumer') {
        showConsumerDashboard();
    } else {
        console.error('Invalid user type:', userType);
        handleLogout();
    }
}

// Handle login
async function handleLogin(event, userType) {
    event.preventDefault();
    
    const formId = userType === 'farmer' ? 'farmerLoginForm' : 'consumerLoginForm';
    const form = document.getElementById(formId);
    const email = form.querySelector('input[type="email"]').value;
    const password = form.querySelector('input[type="password"]').value;
    
    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                password,
                userType
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        // Verify user type matches selected type
        if (data.user.userType !== userType) {
            throw new Error(`Invalid login. This account is registered as a ${data.user.userType}`);
        }

        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        currentUser = data.user;

        // Update UI and navigate
        updateAuthUI();
        navigateToUserDashboard();

    } catch (error) {
        console.error('Login error:', error);
        alert(error.message || 'Login failed');
    }
}

// Select user type for registration
function selectUserType(type) {
    document.getElementById('userType').value = type;
    toggleConsumerFields(type);
}

// Toggle consumer-specific fields based on user type
function toggleConsumerFields(userType) {
    const consumerFields = document.getElementById('consumerFields');
    const farmerFields = document.getElementById('farmerFields');
    const consumerInputs = consumerFields.querySelectorAll('input, select');
    const farmerInputs = farmerFields.querySelectorAll('input');
    
    if (userType === 'consumer') {
        consumerFields.classList.remove('hidden');
        farmerFields.classList.add('hidden');
        consumerInputs.forEach(input => input.required = true);
        farmerInputs.forEach(input => input.required = false);
    } else {
        consumerFields.classList.add('hidden');
        farmerFields.classList.remove('hidden');
        consumerInputs.forEach(input => input.required = false);
        farmerInputs.forEach(input => input.required = true);
    }
}

// Handle registration
async function handleRegister(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        userType: document.getElementById('userType').value
    };

    // Add user type specific fields
    if (formData.userType === 'consumer') {
        formData.businessName = document.getElementById('businessName').value;
        formData.phoneNumber = document.getElementById('phoneNumber').value;
        formData.businessType = document.getElementById('businessType').value;
    } else {
        formData.farmName = document.getElementById('farmName').value;
        formData.farmLocation = document.getElementById('farmLocation').value;
        formData.farmSize = document.getElementById('farmSize').value;
        formData.certifications = document.getElementById('certifications').value;
    }

    try {
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message);
        }

        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        currentUser = data.user;

        // Update UI and navigate
        updateAuthUI();
        navigateTo('dashboard');

    } catch (error) {
        console.error('Registration error:', error);
        alert(error.message || 'Registration failed');
    }
}

// Handle logout
function handleLogout() {
    console.log('Logging out...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    currentUser = null;
    selectedLoginType = null;
    updateAuthUI();
    navigateTo('home');
}

// Update UI based on auth state
function updateAuthUI() {
    const isAuth = isLoggedIn();
    const loginLink = document.getElementById('loginLink');
    const dashboardLink = document.getElementById('dashboardLink');
    const logoutLink = document.getElementById('logoutLink');

    if (isAuth) {
        // Hide login, show dashboard/logout
        if (loginLink) loginLink.classList.add('hidden');
        if (dashboardLink) {
            dashboardLink.classList.remove('hidden');
            // Update dashboard button text based on user type
            const userType = getUserType();
            dashboardLink.textContent = `${userType === 'farmer' ? 'Farmer' : 'Consumer'} Dashboard`;
            // Ensure consistent styling
            dashboardLink.className = 'bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200';
        }
        if (logoutLink) logoutLink.classList.remove('hidden');
    } else {
        // Show login, hide dashboard/logout
        if (loginLink) loginLink.classList.remove('hidden');
        if (dashboardLink) dashboardLink.classList.add('hidden');
        if (logoutLink) logoutLink.classList.add('hidden');
    }
}

// Select login type (farmer or consumer)
function selectLoginType(type) {
    selectedLoginType = type;
    document.getElementById('loginUserType').value = type;
    
    // Update button styles
    const farmerBtn = document.getElementById('farmerLoginBtn');
    const consumerBtn = document.getElementById('consumerLoginBtn');
    
    if (type === 'farmer') {
        farmerBtn.classList.remove('bg-white', 'hover:bg-green-50', 'border-gray-200', 'text-gray-700');
        farmerBtn.classList.add('bg-green-600', 'text-white', 'border-green-600');
        
        consumerBtn.classList.remove('bg-green-600', 'text-white', 'border-green-600');
        consumerBtn.classList.add('bg-white', 'hover:bg-green-50', 'border-gray-200', 'text-gray-700');
    } else {
        consumerBtn.classList.remove('bg-white', 'hover:bg-green-50', 'border-gray-200', 'text-gray-700');
        consumerBtn.classList.add('bg-green-600', 'text-white', 'border-green-600');
        
        farmerBtn.classList.remove('bg-green-600', 'text-white', 'border-green-600');
        farmerBtn.classList.add('bg-white', 'hover:bg-green-50', 'border-gray-200', 'text-gray-700');
    }
}

// Make functions available globally
window.isLoggedIn = isLoggedIn;
window.getUserType = getUserType;
window.logout = handleLogout;
window.updateAuthUI = updateAuthUI;
window.selectLoginType = selectLoginType;
window.handleLogin = handleLogin;

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize auth state
    initializeAuth();
    
    // Add event listener for logout link
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }

    // Add event listener for login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => handleLogin(e, selectedLoginType));
    }
});

document.getElementById('registerForm')?.addEventListener('submit', handleRegister);

// Show register page by default when not logged in
if (!isLoggedIn()) {
    showSection('guestHomeSection');
}

