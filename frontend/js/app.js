// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication state and update UI
    updateAuthUI();
    
    // If user is logged in, redirect to appropriate dashboard
    if (isLoggedIn()) {
        navigateTo('dashboard');
    } else {
        navigateTo('home');
    }
});
