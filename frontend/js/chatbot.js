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
                <h3>AI Farming Assistant</h3>
                <button onclick="toggleChatbot()" style="background: none; border: none; color: white; cursor: pointer;">✕</button>
            </div>
            <div class="chatbot-messages" id="chatMessages">
                <div class="chat-message bot">
                    <div class="message-content">
                        Hello! I'm your AI farming assistant powered by Google Gemini. I can help you with:

                        🌱 Crop Management
                        - Soil preparation and nutrients
                        - Irrigation techniques
                        - Growth optimization
                        - Pest and disease control

                        📦 Produce Quality
                        - Post-harvest handling
                        - Storage optimization
                        - Quality assessment

                        💰 Market Insights
                        - Pricing strategies
                        - Distribution channels
                        - Cost optimization

                        How can I assist you today?
                    </div>
                </div>
            </div>
            <div class="chatbot-input">
                <input type="text" id="chatInput" placeholder="Ask about farming, produce quality, or market insights..." onkeypress="handleChatKeyPress(event)">
                <button onclick="sendMessage()">Send</button>
            </div>
        </div>
    `);

    // Add chatbot styles if not already present
    if (!document.getElementById('chatbot-styles')) {
        const styles = document.createElement('style');
        styles.id = 'chatbot-styles';
        styles.textContent = `
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
        `;
        document.head.appendChild(styles);
    }
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
        // Show typing indicator
        addMessageToChat('Thinking...', 'bot', 'typing-indicator');
        
        // Send message to backend
        const response = await fetch('http://localhost:3000/api/chatbot/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ message })
        });
        
        // Remove typing indicator
        const typingIndicator = document.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to get response');
        }
        
        // Add bot response to chat
        addMessageToChat(data.reply, 'bot');
    } catch (error) {
        console.error('Chat error:', error);
        // Remove typing indicator if it exists
        const typingIndicator = document.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
        addMessageToChat('Sorry, I encountered an error. Please try again.', 'bot');
    }
}

// Add message to chat window
function addMessageToChat(message, type, className = '') {
    const messagesDiv = document.getElementById('chatMessages');
    const messageHTML = `
        <div class="chat-message ${type} ${className}">
            <div class="message-content">${message}</div>
        </div>
    `;
    
    messagesDiv.insertAdjacentHTML('beforeend', messageHTML);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Initialize chatbot when page loads
document.addEventListener('DOMContentLoaded', initChatbot);
