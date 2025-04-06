const router = require('express').Router();
const { GoogleGenAI } = require('@google/genai');

// Initialize Gemini AI with the API key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// System prompt for agricultural advice
const SYSTEM_PROMPT = `You are a concise agricultural advisor. Provide brief, practical farming advice in 2-3 sentences maximum. Focus on specific actionable steps with exact measurements and techniques. Keep responses short and to the point.`;

// Chat endpoint
router.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        // Combine system prompt with user message
        const fullPrompt = `${SYSTEM_PROMPT}\n\nUser Question: ${message}`;
        
        // Generate response using the model
        const response = await ai.models.generateContent({
            model: "gemini-pro",
            contents: fullPrompt,
        });

        res.json({ reply: response.text });
    } catch (error) {
        console.error('Chatbot error:', error);
        res.status(500).json({ 
            message: 'Error processing your request',
            error: error.message 
        });
    }
});

module.exports = router;
