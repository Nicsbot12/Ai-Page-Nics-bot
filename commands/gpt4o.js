const axios = require('axios');

module.exports = {
  name: 'gpt4o',
  description: 'Conversational GPT-4 with image support',
  author: 'Nics',

  async execute(senderId, args, pageAccessToken, sendMessage) {
    const prompt = args.join(' ');
    if (!prompt) {
      sendMessage(senderId, { text: '🌟 Hello, I\'m GPT-4o, How may I assist you today?' }, pageAccessToken);
      return;
    }

    try {
      const apiUrl = `https://rest-api-production-5054.up.railway.app/ai?prompt=${encodeURIComponent(prompt)}&uid=${senderId}`;
      const response = await axios.get(apiUrl);

      const text = response.data.message || 'No response received from GPT-4o. Please try again later.';
      const attachments = response.data.attachments || [];

      // Send the main text response
      sendMessage(senderId, { text }, pageAccessToken);

      // Check if there are any image attachments
      if (attachments.length > 0) {
        const imageAttachments = attachments.filter(att => att.type === 'image'); // Only handle image attachments

        if (imageAttachments.length > 0) {
          const attachmentMessages = imageAttachments.map(att => ({
            attachment: {
              type: 'image', // Ensure we're sending image type attachments
              payload: {
                url: att.url, // Send the image URL directly
                is_reusable: true // Optionally mark the image as reusable
              }
            }
          }));

          // Send each image attachment
          for (let attachmentMessage of attachmentMessages) {
            sendMessage(senderId, attachmentMessage, pageAccessToken);
          }
        }
      }

    } catch (error) {
      console.error('Error calling GPT-4 API with images:', error);
      sendMessage(senderId, { text: 'Sorry, there was an error processing your request.' }, pageAccessToken);
    }
  }
};
