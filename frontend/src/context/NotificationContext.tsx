import React, { createContext, useContext, useState } from 'react';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface NotificationContextType {
  notifications: Notification[];
  showNotification: (title: string, message: string, type: Notification['type']) => void;
  hideNotification: (id: number) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  showNotification: () => {},
  hideNotification: () => {}
});

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = (title: string, message: string, type: Notification['type'] = 'info') => {
    const id = Date.now();
    const notification = { id, title, message, type };
    
    setNotifications(prev => [...prev, notification]);

    // Auto-hide after 5 seconds
    setTimeout(() => hideNotification(id), 5000);
  };

  const hideNotification = (id: number) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notifications, showNotification, hideNotification }}>
      {children}
      {/* Notification Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-4">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`notification transform transition-all duration-300 ease-in-out translate-x-0 opacity-100
              ${notification.type === 'success' ? 'bg-green-50 border-green-500' :
                notification.type === 'error' ? 'bg-red-50 border-red-500' :
                notification.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                'bg-blue-50 border-blue-500'}
              border-l-4 p-4 rounded shadow-lg max-w-sm`}
          >
            <div className="flex items-start">
              <div className="ml-3 w-0 flex-1 pt-0.5">
                <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                <p className="mt-1 text-sm text-gray-500">{notification.message}</p>
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  className="inline-flex text-gray-400 hover:text-gray-500"
                  onClick={() => hideNotification(notification.id)}
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};
