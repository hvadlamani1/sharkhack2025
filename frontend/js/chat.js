// Chatbot state
let isChatbotVisible = false;
let chatbotInitialized = false;
let chatMessages = [];

// Check if we're on the farmer dashboard
function isOnFarmerDashboard() {
    return window.location.pathname.includes('dashboard') && localStorage.getItem('userType') === 'farmer';
}

// Check if chatbot elements already exist
function chatbotExists() {
    return document.querySelector('.chatbot-container') !== null || 
           document.querySelector('.chatbot-toggle') !== null ||
           document.querySelector('#chatbot-root') !== null; // Check for dashboard chat container
}

// Initialize chatbot
function initChatbot() {
    // Only show chatbot for farmers
    const userType = localStorage.getItem('userType');
    if (userType !== 'farmer') {
        return;
    }

    // Add chatbot HTML
    document.body.insertAdjacentHTML('beforeend', `
        <button class="chatbot-toggle" onclick="toggleChatbot()">💬</button>
        <div class="chatbot-container chatbot-hidden">
            <div class="chatbot-header">
                <h3>Farming Assistant</h3>
                <button onclick="toggleChatbot()" style="background: none; border: none; color: white; cursor: pointer;">✕</button>
            </div>
            <div class="chatbot-messages" id="chatMessages">
                <div class="chat-message bot">
                    <div class="message-content">
                        Hello! I'm your farming assistant. Ask me anything about crop management, produce quality, market trends, storage, sustainability, or pest control.
                    </div>
                </div>
            </div>
            <div class="chatbot-input">
                <input type="text" id="chatInput" placeholder="Type your farming question..." onkeypress="handleChatKeyPress(event)">
                <button onclick="sendMessage()">Send</button>
            </div>
        </div>
    `);

    // Add chatbot styles
    const style = document.createElement('style');
    style.textContent = `
        .chatbot-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 350px;
            height: 500px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            display: flex;
            flex-direction: column;
            z-index: 1000;
        }
        
        .chatbot-hidden {
            display: none;
        }
        
        .chatbot-toggle {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            border-radius: 30px;
            background: #4CAF50;
            color: white;
            border: none;
            font-size: 24px;
            cursor: pointer;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 1000;
        }
        
        .chatbot-header {
            background: #4CAF50;
            color: white;
            padding: 15px;
            border-radius: 10px 10px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .chatbot-messages {
            flex-grow: 1;
            overflow-y: auto;
            padding: 15px;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .chat-message {
            max-width: 80%;
            padding: 10px 15px;
            border-radius: 15px;
            margin-bottom: 5px;
        }
        
        .chat-message.user {
            background: #E3F2FD;
            align-self: flex-end;
            border-bottom-right-radius: 5px;
        }
        
        .chat-message.bot {
            background: #F5F5F5;
            align-self: flex-start;
            border-bottom-left-radius: 5px;
        }
        
        .chatbot-input {
            padding: 15px;
            border-top: 1px solid #eee;
            display: flex;
            gap: 10px;
        }
        
        .chatbot-input input {
            flex-grow: 1;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            outline: none;
        }
        
        .chatbot-input button {
            padding: 10px 20px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }
        
        .chatbot-input button:hover {
            background: #45a049;
        }
        
        .message-content {
            white-space: pre-line;
        }

        .typing-indicator {
            display: flex;
            gap: 4px;
            padding: 8px 12px;
            background: #f0f0f0;
            border-radius: 10px;
            width: fit-content;
        }
        
        .typing-indicator span {
            width: 8px;
            height: 8px;
            background: #4CAF50;
            border-radius: 50%;
            display: inline-block;
            animation: typing 1s infinite ease-in-out;
        }
        
        .typing-indicator span:nth-child(1) { animation-delay: 0.2s; }
        .typing-indicator span:nth-child(2) { animation-delay: 0.3s; }
        .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
        
        @keyframes typing {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
        }
    `;
    document.head.appendChild(style);

    // Load saved messages
    loadMessages();
}

// Cleanup chatbot elements
function cleanupChatbot() {
    // Don't remove dashboard chat elements
    if (!isOnFarmerDashboard()) {
        const existingChatbot = document.querySelector('.chatbot-container');
        const existingToggle = document.querySelector('.chatbot-toggle');
        if (existingChatbot) existingChatbot.remove();
        if (existingToggle) existingToggle.remove();
    }
    chatbotInitialized = false;
    isChatbotVisible = false;
}

// Toggle chatbot visibility
function toggleChatbot() {
    const chatbot = document.querySelector('.chatbot-container');
    const toggle = document.querySelector('.chatbot-toggle');
    
    isChatbotVisible = !isChatbotVisible;
    
    if (isChatbotVisible) {
        chatbot.classList.remove('chatbot-hidden');
        toggle.classList.add('chatbot-hidden');
        document.getElementById('chatInput').focus();
    } else {
        chatbot.classList.add('chatbot-hidden');
        toggle.classList.remove('chatbot-hidden');
    }
}

// Handle enter key in chat input
function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Send message to chatbot
async function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Clear input
    input.value = '';
    
    // Add user message to chat
    const messagesDiv = document.getElementById('chatMessages');
    messagesDiv.insertAdjacentHTML('beforeend', `
        <div class="chat-message user">
            <div class="message-content">${message}</div>
        </div>
    `);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    
    // Save user message
    chatMessages.push({ message, type: 'user' });
    saveMessages();
    
    try {
        // Show loading indicator
        const loadingId = Date.now();
        messagesDiv.insertAdjacentHTML('beforeend', `
            <div class="chat-message bot" id="loading-${loadingId}">
                <div class="message-content">
                    <div class="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        `);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
        
        // Send message to backend
        const response = await fetch('http://localhost:3000/api/chatbot/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ message })
        });
        
        // Remove loading indicator
        const loadingIndicator = document.getElementById(`loading-${loadingId}`);
        if (loadingIndicator) {
            loadingIndicator.remove();
        }
        
        const data = await response.json();
        console.log('Server response:', data);
        
        // Add bot response to chat
        messagesDiv.insertAdjacentHTML('beforeend', `
            <div class="chat-message bot">
                <div class="message-content">${data.reply}</div>
            </div>
        `);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
        
        // Save bot message
        chatMessages.push({ message: data.reply, type: 'bot' });
        saveMessages();
        
    } catch (error) {
        console.error('Chat error:', error);
        messagesDiv.insertAdjacentHTML('beforeend', `
            <div class="chat-message bot">
                <div class="message-content">Sorry, I encountered an error. Please try again.</div>
            </div>
        `);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
}

// Save messages to localStorage
function saveMessages() {
    localStorage.setItem('chatMessages', JSON.stringify(chatMessages));
}

// Load messages from localStorage
function loadMessages() {
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
        try {
            chatMessages = JSON.parse(savedMessages);
            const messagesDiv = document.getElementById('chatMessages');
            messagesDiv.innerHTML = ''; // Clear default message
            
            // Restore all messages
            chatMessages.forEach(msg => {
                const messageHTML = `
                    <div class="chat-message ${msg.type}">
                        <div class="message-content">${msg.message}</div>
                    </div>
                `;
                messagesDiv.insertAdjacentHTML('beforeend', messageHTML);
            });
            
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        } catch (error) {
            console.error('Error loading messages:', error);
            chatMessages = [];
        }
    }
}

// Initialize chatbot when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Wait a short moment to ensure dashboard elements are loaded
    setTimeout(() => {
        if (!chatbotExists()) {
            initChatbot();
        }
    }, 100);
});

// Re-initialize chatbot when user type changes
window.addEventListener('storage', (event) => {
    if (event.key === 'userType') {
        if (!chatbotExists()) {
            cleanupChatbot();
            initChatbot();
        }
    }
});

// Make functions available globally
window.initChatbot = initChatbot;
window.cleanupChatbot = cleanupChatbot;
window.toggleChatbot = toggleChatbot;
window.handleChatKeyPress = handleChatKeyPress;
window.sendMessage = sendMessage; 