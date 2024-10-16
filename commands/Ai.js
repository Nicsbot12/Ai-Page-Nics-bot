const axios = require('axios');

module.exports = {
  name: 'ai',
  description: 'Ask a question',
  author: 'Nics (REST API)',
  async execute(senderId, args, pageAccessToken, sendMessage) {
    const prompt = args.join(' ');

    // Check for empty prompt
    if (!prompt) {
      sendMessage(senderId, { text: 'Please provide a question.' }, pageAccessToken);
      return;
    }

    try {
      const apiUrl = `https://nics-api.onrender.com/api/chatgpt?question=${encodeURIComponent(prompt)}`;
      const response = await axios.get(apiUrl);
      let text = response.data;

      // Log response for debugging
      console.log('API Response:', text);

      // Ensure text is a UTF-8 encoded string
      if (typeof text !== 'string') {
        text = JSON.stringify(text); // Convert to string if not already
      }

      // Remove non-UTF-8 characters if necessary
      text = text.replace(/[^\x20-\x7E]/g{}", ''); // Remove non-ASCII characters

      // Split the response into chunks if it exceeds 2000 characters
      const maxMessageLength = 2000;
      if (text.length > maxMessageLength) {
        const messages = splitMessageIntoChunks(text, maxMessageLength);
        console.log(`Sending ${messages.length} messages`); // Debug: number of messages sent
        for (const message of messages) {
          console.log('Sending message:', message); // Debug: content of each message
          sendMessage(senderId, { text: message }, pageAccessToken);
        }
      } else {
        console.log('Sending single message:', text); // Debug: content of the single message
        sendMessage(senderId, { text }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error calling GPT-4 API:', error.response ? error.response.data : error.message);
      sendMessage(senderId, { text: 'Sorry, there was an error processing your request.' }, pageAccessToken);
    }
  }
};

function splitMessageIntoChunks(message, chunkSize) {
  const chunks = [];
  for (let i = 0; i < message.length; i += chunkSize) {
    chunks.push(message.slice(i, i + chunkSize));
  }
  return chunks;
}
  
