// Shared utility functions

// API calls with authentication
async function authenticatedFetch(url, options = {}) {
    const token = localStorage.getItem('token');
    return fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
}

// Make functions available globally
window.authenticatedFetch = authenticatedFetch;
