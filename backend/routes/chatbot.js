const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Chat endpoint
router.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        console.log('Received chat request:', message);

        // Generate response
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: message,
            config: {
                systemInstruction: `You are an expert agricultural advisor. Provide extremely concise answers in 1-2 lines only. Be direct and to the point. No explanations or additional context. Focus on giving practical, actionable advice.`,
            }
        });

        console.log('Gemini API response:', response);
        
        // Extract the text from the response - handle different response formats
        let replyText = 'No response generated';
        
        if (typeof response === 'string') {
            replyText = response;
        } else if (response && typeof response === 'object') {
            if (response.text) {
                replyText = response.text;
            } else if (response.candidates && response.candidates.length > 0) {
                replyText = response.candidates[0].content.parts[0].text;
            } else if (response.response) {
                replyText = response.response;
            }
        }
        
        console.log('Extracted reply text:', replyText);

        res.json({ 
            reply: replyText,
            success: true 
        });
    } catch (error) {
        console.error('Chatbot error:', error);
        res.status(500).json({ 
            message: 'Error processing your request',
            error: error.message,
            success: false
        });
    }
});

module.exports = router;
