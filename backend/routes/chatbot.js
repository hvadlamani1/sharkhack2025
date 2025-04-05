const router = require('express').Router();
const { GoogleGenAI } = require('@google/genai');

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Chat endpoint
router.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        // Generate response
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: message,
            config: {
                systemInstruction: `You are an expert agricultural advisor with deep knowledge in farming practices. Your expertise includes:

1. Crop Management:
- Soil preparation and nutrient management
- Irrigation techniques and scheduling
- Growth optimization methods
- Pest and disease control strategies

2. Produce Quality:
- Post-harvest handling best practices
- Storage optimization techniques
- Quality assessment standards

3. Market Insights:
- Pricing strategies
- Distribution channels
- Cost optimization

Provide specific, practical advice with exact measurements and techniques. Focus on sustainable farming practices.`,
            }
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
