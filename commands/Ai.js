const Groq = require('groq-sdk');
const vision = require('@google-cloud/vision');

const groq = new Groq({ apiKey: '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' });

const messageHistory = new Map();
const maxMessageLength = 2000;

// Function to split a message into chunks of specified length
function splitMessageIntoChunks(text, maxLength) {
  const messages = [];
  for (let i = 0; i < text.length; i += maxLength) {
    messages.push(text.slice(i, i + maxLength));
  }
  return messages;
}

// Initialize the Vision API client
const client = new vision.ImageAnnotatorClient();

// Function to recognize an image using Google Cloud Vision
async function recognizeImage(imageUrl) {
  const [result] = await client.textDetection(imageUrl);
  const detections = result.textAnnotations;
  return detections.length > 0 ? detections[0].description : 'No text found.';
}

module.exports = {
  name: 'ai',
  description: 'response within seconds',
  author: 'Nics',

  async execute(senderId, messageText, pageAccessToken, sendMessage) {
    try {
      console.log("User Message:", messageText);

      // Send an empty message to indicate processing
      sendMessage(senderId, { text: '' }, pageAccessToken);

      let userHistory = messageHistory.get(senderId) || [];
      if (userHistory.length === 0) {
        userHistory.push({ role: 'system', content: 'Your name is Nics Bot, created by Nico Adajar.' });
      }
      userHistory.push({ role: 'user', content: messageText });

      // Check if the message contains an image URL (simple check)
      const imageUrlPattern = /\.(jpeg|jpg|gif|png|bmp|svg)$/i;
      if (imageUrlPattern.test(messageText)) {
        const recognizedContent = await recognizeImage(messageText);
        userHistory.push({ role: 'assistant', content: recognizedContent });
        messageHistory.set(senderId, userHistory);
        return sendMessage(senderId, { text: recognizedContent }, pageAccessToken);
      }

      const chatCompletion = await groq.chat.completions.create({
        messages: userHistory,
        model: 'llama3-8b-8192',
        temperature: 1,
        max_tokens: 1025,
        top_p: 1,
        stream: true,
        stop: null
      });

      let responseMessage = '';

      for await (const chunk of chatCompletion) {
        const chunkContent = chunk.choices[0]?.delta?.content || '';
        responseMessage += chunkContent; // Compile the complete response
        
        // Check if the current response message exceeds the max length
        if (responseMessage.length >= maxMessageLength) {
          const messages = splitMessageIntoChunks(responseMessage, maxMessageLength);
          for (const message of messages) {
            sendMessage(senderId, { text: message }, pageAccessToken); // Send each chunk
          }
          responseMessage = ''; // Reset responseMessage after sending
        }
      }

      // Log the raw response from the API
      console.log("Raw API Response:", responseMessage);

      // Send any remaining part of the response
      if (responseMessage) {
        userHistory.push({ role: 'assistant', content: responseMessage });
        messageHistory.set(senderId, userHistory);
        sendMessage(senderId, { text: responseMessage }, pageAccessToken);
      } else {
        throw new Error("Received empty response from Groq.");
      }

    } catch (error) {
      console.error('Error communicating with Groq:', error.message);
      sendMessage(senderId, { text: "I'm busy right now, please try again later." }, pageAccessToken);
    }
  }
};
        
