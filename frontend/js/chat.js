// Chat state
let isChatOpen = false;
let messages = [];

// Toggle chat window
function toggleChat() {
    const chatWindow = document.getElementById('chatWindow');
    const chatToggleBtn = document.getElementById('chatToggleBtn');
    
    isChatOpen = !isChatOpen;
    chatWindow.classList.toggle('hidden');
    
    if (isChatOpen && messages.length === 0) {
        // Add welcome message
        addMessage({
            type: 'assistant',
            content: 'Hello! I\'m your SmartFarm Assistant. How can I help you today?'
        });
    }
}

// Add a message to the chat
function addMessage(message) {
    messages.push(message);
    
    const chatMessages = document.getElementById('chatMessages');
    const messageElement = document.createElement('div');
    
    messageElement.className = message.type === 'user' 
        ? 'flex justify-end mb-4'
        : 'flex justify-start mb-4';
    
    messageElement.innerHTML = `
        <div class="${message.type === 'user' 
            ? 'bg-green-600 text-white'
            : 'bg-gray-200 text-gray-800'} 
            rounded-lg py-2 px-4 max-w-[80%]">
            ${message.content}
        </div>
    `;
    
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Send a message
async function sendMessage(event) {
    event.preventDefault();
    
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    if (!message) return;
    
    // Add user message
    addMessage({
        type: 'user',
        content: message
    });
    
    messageInput.value = '';
    
    try {
        // Process the message and get response
        const response = await processMessage(message);
        
        // Add assistant response
        addMessage({
            type: 'assistant',
            content: response
        });
    } catch (error) {
        console.error('Error processing message:', error);
        addMessage({
            type: 'assistant',
            content: 'Sorry, I encountered an error. Please try again.'
        });
    }
}

// Process the message and return a response
async function processMessage(message) {
    // Simple response logic based on keywords
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        return 'Hello! How can I assist you with your farming today?';
    }
    
    if (lowerMessage.includes('add produce')) {
        return 'To add new produce, click the "+ Add New Produce" button at the top of your dashboard. You\'ll need to provide details like produce type, amount, grade, and price.';
    }
    
    if (lowerMessage.includes('edit') || lowerMessage.includes('update')) {
        return 'To edit a produce listing, find the item in your listings and click the "Edit" button. You can then modify any details as needed.';
    }
    
    if (lowerMessage.includes('delete') || lowerMessage.includes('remove')) {
        return 'To delete a produce listing, locate the item and click the "Delete" button. Please note that this action cannot be undone.';
    }
    
    if (lowerMessage.includes('price')) {
        return 'You can set and update prices for your produce when adding or editing a listing. Consider market rates and quality grade when pricing your items.';
    }
    
    if (lowerMessage.includes('grade')) {
        return 'We use a simple grading system: Grade A for premium quality and Grade B for standard quality. Choose the appropriate grade when listing your produce.';
    }
    
    if (lowerMessage.includes('help')) {
        return `Here are some things I can help you with:
- Adding new produce listings
- Editing existing listings
- Understanding pricing strategies
- Produce grading system
- Managing your inventory
Just ask me about any of these topics!`;
    }
    
    return 'I\'m here to help with managing your produce listings. You can ask me about adding, editing, or deleting listings, pricing strategies, and grading system.';
}

// Initialize chat when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chatForm');
    if (chatForm) {
        chatForm.addEventListener('submit', sendMessage);
    }
}); 