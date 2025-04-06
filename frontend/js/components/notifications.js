// Notification system
class NotificationManager {
    constructor() {
        this.container = null;
        this.notifications = [];
        this.initialize();
    }

    initialize() {
        // Create notification container
        this.container = document.createElement('div');
        this.container.className = 'fixed top-4 right-4 z-50 space-y-4';
        document.body.appendChild(this.container);

        // Listen for notification events
        window.addEventListener('show-notification', (event) => {
            this.show(event.detail.title, event.detail.message);
        });
    }

    show(title, message, type = 'info') {
        const id = Date.now();
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification transform transition-all duration-300 ease-in-out translate-x-0 opacity-100
            ${type === 'success' ? 'bg-green-50 border-green-500' :
              type === 'error' ? 'bg-red-50 border-red-500' :
              type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
              'bg-blue-50 border-blue-500'}
            border-l-4 p-4 rounded shadow-lg max-w-sm`;
        
        notification.innerHTML = `
            <div class="flex items-start">
                <div class="ml-3 w-0 flex-1 pt-0.5">
                    <p class="text-sm font-medium text-gray-900">${title}</p>
                    <p class="mt-1 text-sm text-gray-500">${message}</p>
                </div>
                <div class="ml-4 flex-shrink-0 flex">
                    <button class="inline-flex text-gray-400 hover:text-gray-500">
                        <span class="sr-only">Close</span>
                        <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        `;

        // Add to notifications array
        this.notifications.push({ id, element: notification });
        
        // Add to container
        this.container.appendChild(notification);

        // Add click handler to close button
        notification.querySelector('button').addEventListener('click', () => {
            this.hide(id);
        });

        // Auto hide after 5 seconds
        setTimeout(() => {
            this.hide(id);
        }, 5000);
    }

    hide(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
            // Add exit animation classes
            notification.element.classList.add('translate-x-full', 'opacity-0');
            
            // Remove after animation
            setTimeout(() => {
                notification.element.remove();
                this.notifications = this.notifications.filter(n => n.id !== id);
            }, 300);
        }
    }

    showSuccess(title, message) {
        this.show(title, message, 'success');
    }

    showError(title, message) {
        this.show(title, message, 'error');
    }

    showWarning(title, message) {
        this.show(title, message, 'warning');
    }
}

// Create and expose singleton instance globally
window.NotificationManager = new NotificationManager();
