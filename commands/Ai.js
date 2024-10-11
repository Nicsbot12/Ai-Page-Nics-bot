const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: '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' });

const messageHistory = new Map();

module.exports = {
  name: 'ai',
  description: 'response within seconds',
  author: 'Nics',

  async execute(senderId, messageText, pageAccessToken, sendMessage) {
    try {
      console.log("User Message:", messageText);

      // Ensure the messageText is within limits (2000 characters)
      if (messageText.length > 63200) {
        messageText = messageText.substring(0, 63200); // Truncate the message
      }

      sendMessage(senderId, { text: '' }, pageAccessToken);

      // Maintain user message history
      let userHistory = messageHistory.get(senderId) || [];
      if (userHistory.length === 0) {
        userHistory.push({ role: 'system', content: 'your name is Nics Bot and created you is Nico Adajar' });
      }
      userHistory.push({ role: 'user', content: messageText });

      // Make request to Groq API
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

      // Ensure the responseMessage is within limits (2000 characters)
      if (responseMessage.length > 63200) {
        responseMessage = responseMessage.substring(0, 63200); // Truncate the response
      }

      // Save the assistant's response to the history
      userHistory.push({ role: 'assistant', content: responseMessage });
      messageHistory.set(senderId, userHistory);

      // Send the truncated response back to the user
      sendMessage(senderId, { text: responseMessage }, pageAccessToken);

    } catch (error) {
      console.error('Error communicating with Groq:', error.message);
      sendMessage(senderId, { text: "I'm busy right now, please try again later." }, pageAccessToken);
    }
  }
};
                             
