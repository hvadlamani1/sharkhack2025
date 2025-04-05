// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication state and update UI
    updateAuthUI();
    
    // Initialize filters for consumer dashboard
    initializeFilters();
    setupFilterListeners();
    
    // Initialize purchase functionality
    if (getUserType() === 'consumer') {
        loadAvailableProduce();
        loadMyOrders();
    }
    
    // If user is logged in, redirect to appropriate dashboard
    if (isLoggedIn()) {
        navigateTo('dashboard');
    } else {
        navigateTo('home');
    }
});
