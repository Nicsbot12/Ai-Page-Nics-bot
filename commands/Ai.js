const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const vision = require('@google-cloud/vision'); // Import the Google Cloud Vision library
const fs = require('fs'); // For file operations

module.exports = {
  name: 'ai',
  description: 'Ask a question to Gemini-1.5 (Google Generative AI) or analyze an image.',
  author: 'Nics (rest api)',

  async execute(senderId, args, pageAccessToken, sendMessage) {
    const apiKey = "AIzaSyBpB8_1oyp_zTO6NsbDjNpjMOoN7mm3CB4";
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Check if the command is for image recognition
    if (args[0] === 'image' && args[1]) {
      const imagePath = args[1]; // Assuming the path to the image is the second argument

      // Call the image recognition function
      try {
        const result = await recognizeImage(imagePath);
        sendMessage(senderId, { text: result }, pageAccessToken);
      } catch (error) {
        console.error('Error recognizing image:', error);
        sendMessage(senderId, { text: 'Sorry, there was an error processing your image.' }, pageAccessToken);
      }
    } else {
      // Generate AI response using Google Generative AI
      const prompt = args.join(' ');

      try {
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

// Function to recognize an image
async function recognizeImage(imagePath) {
  // Creates a client
  const client = new vision.ImageAnnotatorClient();

  // Performs label detection on the image file
  const [result] = await client.labelDetection(imagePath);
  const labels = result.labelAnnotations;

  // Construct a response string
  if (labels.length > 0) {
    return `This image contains: ${labels.map(label => label.description).join(', ')}`;
  } else {
    return 'No labels found for this image.';
  }
          }
      
