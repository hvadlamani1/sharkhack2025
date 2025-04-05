// Handle notifications
let notificationsVisible = false;

// Load notifications
async function loadNotifications() {
    try {
        const response = await authenticatedFetch('http://localhost:3000/api/notifications/my-notifications');
        const notifications = await response.json();
        
        // Update notification count
        const unreadCount = notifications.filter(n => !n.read).length;
        const countElement = document.getElementById('notificationsCount');
        countElement.textContent = unreadCount || '';
        countElement.style.display = unreadCount ? 'block' : 'none';
        
        // Update notifications menu
        const menu = document.getElementById('notificationsMenu');
        menu.innerHTML = notifications.length ? notifications.map(notification => `
            <div class="notification-item ${notification.read ? '' : 'unread'}" 
                 data-id="${notification._id}"
                 onclick="markNotificationRead('${notification._id}')">
                <div class="notification-content">${notification.message}</div>
                <div class="time">${new Date(notification.createdAt).toLocaleString()}</div>
            </div>
        `).join('') : '<div class="notification-item">No notifications</div>';
        
    } catch (error) {
        console.error('Load notifications error:', error);
    }
}

// Mark notification as read
async function markNotificationRead(id) {
    try {
        await authenticatedFetch(`http://localhost:3000/api/notifications/${id}/read`, {
            method: 'PATCH'
        });
        await loadNotifications();
    } catch (error) {
        console.error('Mark notification read error:', error);
    }
}

// Toggle notifications menu
function toggleNotifications() {
    const menu = document.getElementById('notificationsMenu');
    notificationsVisible = !notificationsVisible;
    menu.classList.toggle('hidden', !notificationsVisible);
    
    if (notificationsVisible) {
        loadNotifications();
    }
}

// Close notifications when clicking outside
document.addEventListener('click', (event) => {
    const menu = document.getElementById('notificationsMenu');
    const btn = document.getElementById('notificationsBtn');
    
    if (notificationsVisible && !menu.contains(event.target) && !btn.contains(event.target)) {
        notificationsVisible = false;
        menu.classList.add('hidden');
    }
});

// Add click handler to notifications button
document.getElementById('notificationsBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    toggleNotifications();
});

// Load notifications periodically
setInterval(loadNotifications, 30000); // Every 30 seconds
