const axios = require('axios');

module.exports = {
  name: 'gpt4',
  description: 'Ask a question to GPT-4',
  author: 'Deku (REST API)',
  async execute(senderId, args, pageAccessToken, sendMessage) {
    const prompt = args.join(' ').trim();
    console.log('Prompt:', prompt); // Optional: Log the prompt for debugging

    // Validate prompt length
    if (prompt.length === 0) {
      return sendMessage(senderId, { text: 'Please enter a valid question.' }, pageAccessToken);
    }

    try {
      const apiUrl = `https://nics-api.onrender.com/api/chatgpt`;
      const response = await axios.post(apiUrl, { question: prompt }); // Use POST for potentially long prompts
      console.log('API Response:', response.data); // Log the response for debugging

      const text = response.data?.chatgpt || 'No response from GPT-4';

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
      const errorMessage = error.response?.data?.message || 'There was an error processing your request.';
      sendMessage(senderId, { text: errorMessage }, pageAccessToken);
    }
  }
};

function splitMessageIntoChunks(message, chunkSize) {
  const chunks = [];
  let currentChunk = '';

  const words = message.split(' ');
  for (const word of words) {
    if ((currentChunk + word).length > chunkSize) {
      chunks.push(currentChunk);
      currentChunk = word + ' '; // Start new chunk with the current word
    } else {
      currentChunk += word + ' ';
    }
  }
  if (currentChunk) {
    chunks.push(currentChunk); // Add remaining chunk
  }
  
  return chunks;
  }
