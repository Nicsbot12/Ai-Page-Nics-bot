const axios = require('axios');

const apiKey = 'sk-vK3bbt4W4WFTlu1pkjXFzfvJ1qLespSgZODES7D2nfT3BlbkFJXwZPX4nywtBpwa8p31GNhQPeh93UdJUsAIBnjD5x8A'; // Replace with your actual OpenAI API key

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

module.exports = {
  name: 'ai',
  description: 'response within seconds',
  author: 'Nics',

  async execute(senderId, messageText, pageAccessToken, sendMessage, imageUrl) {
    try {
      console.log("User Message:", messageText);

      // Send an empty message to indicate processing
      sendMessage(senderId, { text: '' }, pageAccessToken);

      let userHistory = messageHistory.get(senderId) || [];
      if (userHistory.length === 0) {
        userHistory.push({ role: 'system', content: 'Your name is Nics Bot, created by Nico Adajar.' });
      }
      userHistory.push({ role: 'user', content: messageText });

      let responseMessage = '';

      const apiUrl = 'https://api.openai.com/v1/chat/completions';

      // Prepare request body for GPT-4o
      const requestBody = {
        model: 'gpt-4',
        messages: userHistory,
        temperature: 1,
        max_tokens: 1025,
        top_p: 1,
        stream: true,
      };

      // If an image URL is provided, include it in the request
      if (imageUrl) {
        requestBody.image = imageUrl; // Include the image URL for analysis
      }

      // Call the OpenAI API
      const response = await axios.post(apiUrl, requestBody, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      // Process the response
      for await (const chunk of response.data) {
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
        throw new Error("Received empty response from GPT-4o.");
      }

    } catch (error) {
      console.error('Error communicating with GPT-4o:', error.message);
      sendMessage(senderId, { text: "I'm busy right now, please try again later." }, pageAccessToken);
    }
  }
};
