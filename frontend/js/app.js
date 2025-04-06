// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('Initializing application...');
        
        // Check if all required functions are available
        if (typeof updateAuthUI !== 'function') {
            throw new Error('Auth module not loaded properly');
        }
        if (typeof navigateTo !== 'function') {
            throw new Error('Navigation module not loaded properly');
        }

        // Initialize authentication state
        updateAuthUI();
        updateNavigationLinks();
        
        // Initialize features
        if (typeof initializeFilters === 'function') {
            initializeFilters();
            setupFilterListeners();
        }
        
        // Initialize tracking if available
        if (typeof initializeTracking === 'function') {
            initializeTracking();
        }
        
        // Initialize chat if available
        if (typeof initializeChat === 'function') {
            initializeChat();
        }

        // Handle initial navigation
        const isLoggedIn = localStorage.getItem('token');
        if (isLoggedIn) {
            const user = JSON.parse(localStorage.getItem('user'));
            if (user && user.type) {
                console.log('User is logged in as:', user.type);
                navigateTo('dashboard');
            } else {
                console.log('Invalid user data, redirecting to login');
                navigateTo('login');
            }
        } else {
            console.log('User not logged in, showing home page');
            navigateTo('home');
        }
    } catch (error) {
        console.error('Error initializing application:', error);
        // Show error to user
        if (typeof showNotification === 'function') {
            showNotification('Error', 'Failed to initialize application. Please refresh the page.', 'error');
        } else {
            alert('Failed to initialize application. Please refresh the page.');
        }
    }
}); 
