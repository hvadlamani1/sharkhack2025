// Auth state management
let currentUser = null;

// Check if user is logged in (token exists)
function isLoggedIn() {
    return localStorage.getItem('token') !== null;
}

// Get current user type
function getUserType() {
    const user = JSON.parse(localStorage.getItem('user'));
    return user ? user.userType : null;
}

// Login function
async function login(email, password) {
    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        currentUser = data.user;

        // Update UI based on user type
        updateAuthUI();
        
        // Navigate to appropriate dashboard
        if (data.user.userType === 'farmer') {
            showFarmerDashboard();
        } else {
            showConsumerDashboard();
        }

        return data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

// Register function
async function register(name, email, password, userType) {
    try {
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password, userType })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }

        // Automatically log in after successful registration
        return login(email, password);
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
}

// Logout function
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
    const authLinks = document.querySelector('.auth-links');
    const loginLink = document.getElementById('loginLink');
    const registerLink = document.getElementById('registerLink');

    if (isAuth) {
        authLinks.classList.remove('hidden');
        loginLink.classList.add('hidden');
        registerLink.classList.add('hidden');
    } else {
        authLinks.classList.add('hidden');
        loginLink.classList.remove('hidden');
        registerLink.classList.remove('hidden');
    }
}

// Event Listeners
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        await login(
            document.getElementById('loginEmail').value,
            document.getElementById('loginPassword').value
        );
    } catch (error) {
        alert(error.message);
    }
});

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        await register(
            document.getElementById('registerName').value,
            document.getElementById('registerEmail').value,
            document.getElementById('registerPassword').value,
            document.getElementById('userType').value
        );
    } catch (error) {
        alert(error.message);
    }
});

document.getElementById('logoutLink').addEventListener('click', (e) => {
    e.preventDefault();
    logout();
});
