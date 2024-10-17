const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = {
  name: 'ai',
  description: 'Ask a question to Gemini-1.5 (Google Generative AI)',
  author: 'Nics (rest api)',
  
  async execute(senderId, args, pageAccessToken, sendMessage) {
    const apiKey = "AIzaSyDuPD1wDOOPPfEJLo1xp2NGt74JzL7Wz_c";
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = args.join(' ');
    
    try {
      // Generate AI response using Google Generative AI
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = await response.text();
      
      console.log('AI Response:', text);

      // Split the response if it exceeds 2000 characters
      const maxMessageLength = 2000;
      if (text.length > maxMessageLength) {
        const messages = splitMessageIntoChunks(text, maxMessageLength);
        for (const message of messages) {
          sendMessage(senderId, { text: message }, pageAccessToken);
        }
      } else {
        sendMessage(senderId, { text }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
      sendMessage(senderId, { text: 'Sorry, there was an error processing your request.' }, pageAccessToken);
    }
  }
};

// Helper function to split a long message into chunks
function splitMessageIntoChunks(message, chunkSize) {
  const chunks = [];
  for (let i = 0; i < message.length; i += chunkSize) {
    chunks.push(message.slice(i, i + chunkSize));
  }
  return chunks;
}
