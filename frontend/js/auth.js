// Auth state management
let currentUser = null;

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('token') !== null;
}

// Get current user type
function getUserType() {
    const user = JSON.parse(localStorage.getItem('user'));
    return user ? user.userType : null;
}

// Login function
async function handleLogin(event) {
    event.preventDefault();
    
    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: document.getElementById('loginEmail').value,
                password: document.getElementById('loginPassword').value
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        currentUser = data.user;

        // Update UI and navigate to appropriate dashboard
        updateAuthUI();
        if (data.user.userType === 'farmer') {
            showFarmerDashboard();
        } else {
            showConsumerDashboard();
        }

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
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    currentUser = null;
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
        loginLink.classList.add('hidden');
        dashboardLink.classList.remove('hidden');
        logoutLink.classList.remove('hidden');
        showSection('dashboard');
    } else {
        // Show login, hide dashboard/logout
        loginLink.classList.remove('hidden');
        dashboardLink.classList.add('hidden');
        logoutLink.classList.add('hidden');
        showSection('guestHomeSection');
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize auth UI
    updateAuthUI();
});

document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
document.getElementById('registerForm')?.addEventListener('submit', handleRegister);
document.getElementById('logoutLink')?.addEventListener('click', (e) => {
    e.preventDefault();
    logout();
});

// Show register page by default when not logged in
if (!isLoggedIn()) {
    showSection('guestHomeSection');
}

