const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const router = express.Router();
const apiKey = "AIzaSyBpB8_1oyp_zTO6NsbDjNpjMOoN7mm3CB4";
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

router.get('/gen', async (req, res) => {
    try {
        const { ask } = req.query;

        const result = await model.generateContent(ask);
        const response = await result.response;
        const text = await response.text();

        res.json({ result: text });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
