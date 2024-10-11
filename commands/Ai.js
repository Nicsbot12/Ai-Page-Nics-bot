const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: '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' });

const messageHistory = new Map();

module.exports = {
  name: 'ai',
  description: 'response within seconds',
  author: 'Nics',

  async execute(senderId, messageText, imageUrl, pageAccessToken, sendMessage) {
    try {
      console.log("User Message:", messageText);

      // Acknowledge message receipt
      sendMessage(senderId, { text: '' }, pageAccessToken);

      // Handle message history
      let userHistory = messageHistory.get(senderId) || [];
      if (userHistory.length === 0) {
        userHistory.push({ role: 'system', content: 'Your name is Nics Bot, created by Nico Adajar' });
      }
      userHistory.push({ role: 'user', content: messageText });

      // Handle Image + Text processing if imageUrl is provided
      if (imageUrl) {
        userHistory.push({
          role: 'user',
          content: [
            { type: 'text', text: messageText },
            { type: 'image_url', image_url: { url: imageUrl } }
          ]
        });
      }

      // Chat Completion Request (supports text + images)
      const chatCompletion = await groq.chat.completions.create({
        messages: userHistory,
        model: 'llama-3.2-11b-vision-preview', // Vision model for image + text
        temperature: 1,
        max_tokens: 1024,
        top_p: 1,
        stream: false, // Change to true if you want streaming
        stop: null
      });

      // Get the response
      let responseMessage = chatCompletion.choices[0]?.message?.content || 'No response from assistant';

      // Update message history with assistant's response
      userHistory.push({ role: 'assistant', content: responseMessage });

      // Save the updated history back to the Map
      messageHistory.set(senderId, userHistory);

      // Send the response to the user
      sendMessage(senderId, { text: responseMessage }, pageAccessToken);

    } catch (error) {
      console.error('Error communicating with Groq:', error.message);
      sendMessage(senderId, { text: "I'm busy right now, please try again later." }, pageAccessToken);
    }
  }
};
