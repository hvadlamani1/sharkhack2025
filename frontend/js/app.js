// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication state and update UI
    updateAuthUI();
    
    // Initialize filters for consumer dashboard
    initializeFilters();
    setupFilterListeners();
    
    // If user is logged in, redirect to appropriate dashboard
    if (isLoggedIn()) {
        navigateTo('dashboard');
    } else {
        navigateTo('home');
    }
});
