const axios = require('axios'); // Use axios to call OpenAI API
const tesseract = require('tesseract.js'); // For image recognition (OCR)

// Message history to keep track of conversations
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

// Function to recognize text in an image
async function recognizeImage(imagePath) {
  try {
    const result = await tesseract.recognize(imagePath);
    return result.data.text;
  } catch (err) {
    console.error('Image recognition failed:', err);
    return '';
  }
}

// OpenAI GPT-4 Turbo API call function
async function callGpt4Turbo(userHistory) {
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4-turbo', // Using GPT-4 Turbo model
      messages: userHistory,
      max_tokens: 1024,
      temperature: 1,
      top_p: 1,
      stream: true,
    }, {
      headers: {
        'Authorization': `Bearer your_openai_api_key`,
        'Content-Type': 'application/json'
      }
    });
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling GPT-4 Turbo:', error.message);
    throw error;
  }
}

module.exports = {
  name: 'ai',
  description: 'response within seconds',
  author: 'Nics',

  async execute(senderId, messageText, pageAccessToken, sendMessage, imagePath = null) {
    try {
      console.log("User Message:", messageText);

      // Send an empty message to indicate processing
      sendMessage(senderId, { text: '' }, pageAccessToken);

      let userHistory = messageHistory.get(senderId) || [];
      if (userHistory.length === 0) {
        userHistory.push({ role: 'system', content: 'Your name is Nics Bot, created by Nico Adajar.' });
      }
      userHistory.push({ role: 'user', content: messageText });

      // If an image path is provided, recognize text in the image
      if (imagePath) {
        const recognizedText = await recognizeImage(imagePath);
        userHistory.push({ role: 'user', content: `Recognized Image Text: ${recognizedText}` });
      }

      // Call GPT-4 Turbo API
      const responseMessage = await callGpt4Turbo(userHistory);

      // Split long responses into chunks if necessary
      const messages = splitMessageIntoChunks(responseMessage, maxMessageLength);
      for (const message of messages) {
        sendMessage(senderId, { text: message }, pageAccessToken); // Send each chunk
      }

      // Update message history
      userHistory.push({ role: 'assistant', content: responseMessage });
      messageHistory.set(senderId, userHistory);

    } catch (error) {
      console.error('Error communicating with GPT-4 Turbo:', error.message);
      sendMessage(senderId, { text: "I'm busy right now, please try again later." }, pageAccessToken);
    }
  }
};
