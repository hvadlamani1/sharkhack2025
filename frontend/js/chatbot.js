// Chatbot state
let isChatbotVisible = false;

// Initialize chatbot
function initChatbot() {
    // Only show chatbot for farmers
    if (getUserType() !== 'farmer') {
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
    addMessageToChat(message, 'user');
    
    try {
        // Send message to backend
        const response = await fetch('http://localhost:3000/api/chatbot/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ message })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to get response');
        }
        
        // Add bot response to chat
        addMessageToChat(data.reply, 'bot');
    } catch (error) {
        console.error('Chat error:', error);
        addMessageToChat('Sorry, I encountered an error. Please try again.', 'bot');
    }
}

// Add message to chat window
function addMessageToChat(message, type) {
    const messagesDiv = document.getElementById('chatMessages');
    const messageHTML = `
        <div class="chat-message ${type}">
            <div class="message-content">${message}</div>
        </div>
    `;
    
    messagesDiv.insertAdjacentHTML('beforeend', messageHTML);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Initialize chatbot when page loads
document.addEventListener('DOMContentLoaded', initChatbot);
