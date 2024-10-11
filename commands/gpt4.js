const axios = require('axios');
const vision = require('@google-cloud/vision'); // Google Cloud Vision

// Initialize the Google Cloud Vision client
const client = new vision.ImageAnnotatorClient();

module.exports = {
  name: 'gpt4',
  description: 'Ask a question to GPT-4 or send an image for recognition',
  author: 'Deku (rest api)',
  
  async execute(senderId, args, pageAccessToken, sendMessage, imageUrl = null) {
    const prompt = args.join(' '); // added space between joined arguments

    // Check if an image URL is provided
    if (imageUrl) {
      // Call the image recognition function if an image is detected
      await recognizeImage(senderId, imageUrl, pageAccessToken, sendMessage);
    } else {
      try {
        const apiUrl = `https://deku-rest-apis.ooguy.com/gpt4?prompt=${encodeURIComponent(prompt)}&uid=100${senderId}`;
        const response = await axios.get(apiUrl);
        const text = response.data.gpt4;

        // Split the response into chunks if it exceeds 2000 characters
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
        console.error('Error calling GPT-4 API:', error);
        sendMessage(senderId, { text: 'An error occurred while processing your request. Please try again later.' }, pageAccessToken);
      }
    }
  }
};

// Function to recognize an image using Google Cloud Vision
async function recognizeImage(senderId, imageUrl, pageAccessToken, sendMessage) {
  try {
    // Perform label detection on the image
    const [result] = await client.labelDetection(imageUrl);
    const labels = result.labelAnnotations;

    if (labels.length > 0) {
      const labelDescriptions = labels.map(label => label.description).join(', ');

      // Send the recognized labels to the user
      sendMessage(senderId, { text: `I recognized the following objects in the image: ${labelDescriptions}` }, pageAccessToken);
    } else {
      sendMessage(senderId, { text: 'I couldn’t recognize anything in the image.' }, pageAccessToken);
    }
  } catch (error) {
    console.error('Error with image recognition:', error);
    sendMessage(senderId, { text: 'There was an error processing the image. Please try again.' }, pageAccessToken);
  }
}

// Helper function to split long messages into smaller chunks
function splitMessageIntoChunks(message, chunkSize) {
  const chunks = [];
  for (let i = 0; i < message.length; i += chunkSize) {
    chunks.push(message.slice(i, i + chunkSize));
  }
  return chunks;
  }
