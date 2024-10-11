const Groq = require('groq-sdk');
const vision = require('@google-cloud/vision'); // Add Google Cloud Vision SDK

// Initialize Groq and Google Vision clients
const groq = new Groq({ apiKey: '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' });
const client = new vision.ImageAnnotatorClient();

const messageHistory = new Map();

module.exports = {
  name: 'ai',
  description: 'response within seconds',
  author: 'Nics',

  async execute(senderId, messageText, pageAccessToken, sendMessage, imageUrl = null) { // Accept imageUrl parameter
    try {
      console.log("User Message:", messageText);

      sendMessage(senderId, { text: '' }, pageAccessToken);

      let userHistory = messageHistory.get(senderId) || [];
      if (userHistory.length === 0) {
        userHistory.push({ role: 'system', content: 'You are a helpful and kind assistant that answers everything.' });
      }
      userHistory.push({ role: 'user', content: messageText });

      // Check if there's an image to process
      if (imageUrl) {
        console.log("Processing image...");

        // Perform image recognition using Google Cloud Vision
        const [result] = await client.labelDetection(imageUrl);
        const labels = result.labelAnnotations.map(label => label.description).join(', ');

        // Add image recognition result to user history
        userHistory.push({ role: 'system', content: `The image contains: ${labels}` });
      }

      // Generate a response using Groq
      const chatCompletion = await groq.chat.completions.create({
        messages: userHistory,
        model: 'llama3-8b-8192',
        temperature: 1,
        max_tokens: 1024,
        top_p: 1,
        stream: true,
        stop: null
      });

      let responseMessage = '';
      for await (const chunk of chatCompletion) {
        responseMessage += (chunk.choices[0] && chunk.choices[0].delta && chunk.choices[0].delta.content) || '';
      }

      userHistory.push({ role: 'assistant', content: responseMessage });
      messageHistory.set(senderId, userHistory);

      sendMessage(senderId, { text: responseMessage }, pageAccessToken);

    } catch (error) {
      console.error('Error:', error.message);
      sendMessage(senderId, { text: "I'm busy right now, please try again later." }, pageAccessToken);
    }
  }
};
                            
