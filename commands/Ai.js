const axios = require('axios');

module.exports = {
  name: 'ai',
  description: 'Ask a question to GPT-4',
  author: 'Nics (rest api)',
  async execute(senderId, args, pageAccessToken, sendMessage) {
    const prompt = args.join(' ');
    try {
      const apiUrl = `https://nics-api.onrender.com/api/chatgpt?question=${encodeURIComponent(prompt)}&uid=100${senderId}`;
      const response = await axios.get(apiUrl);
      const text = response.data.content;

      console.log('API Response:', text);

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
      sendMessage(senderId, { text: 'Sorry, there was an error processing your request.' }, pageAccessToken);
    }
  }
};

function splitMessageIntoChunks(message, chunkSize) {
  const chunks = [];
  let currentChunk = '';

  const words = message.split(' '); // Split the message by spaces (words)
  
  for (const word of words) {
    if (currentChunk.length + word.length + 1 > chunkSize) {
      chunks.push(currentChunk); // Add the current chunk to chunks
      currentChunk = word; // Start a new chunk with the current word
    } else {
      currentChunk += (currentChunk.length ? ' ' : '') + word; // Append the word to the current chunk
    }
  }
  
  if (currentChunk.length) {
    chunks.push(currentChunk); // Push the last chunk if it exists
  }

  return chunks;
      }
