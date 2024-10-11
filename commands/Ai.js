const { Configuration, OpenAIApi } = require('openai');

// Set up OpenAI configuration with API key
const configuration = Configuration({
  apiKey: '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',
});

const openai = new OpenAIApi(configuration);

// Message history map to keep track of user conversations
const messageHistory = new Map();

module.exports = {
  name: 'ai',
  description: 'AI GPT-4 Assistant',
  author: 'Burat',

  async execute(senderId, messageText, pageAccessToken, sendMessage) {
    try {
      console.log("User Message:", messageText);

      // Send an initial response to the user (can be adjusted or omitted)
      sendMessage(senderId, { text: 'Thinking...' }, pageAccessToken);

      // Retrieve or initialize the user conversation history
      let userHistory = messageHistory.get(senderId) || [];
      if (userHistory.length === 0) {
        userHistory.push({ role: 'system', content: 'You are a helpful and kind assistant that answers everything.' });
      }
      userHistory.push({ role: 'user', content: messageText });

      // Call the OpenAI GPT-4 API to generate a completion
      const response = await openai.createChatCompletion({
        model: 'gpt-4', // Use GPT-4 model
        messages: userHistory,
        temperature: 1,
        max_tokens: 1024,
        top_p: 1,
        stream: false,  // GPT-4 streaming is also available but this example uses normal completion
      });

      // Get the assistant's response message
      const responseMessage = response.data.choices[0].message.content;

      // Add the assistant's message to the conversation history
      userHistory.push({ role: 'assistant', content: responseMessage });

      // Update the message history for the user
      messageHistory.set(senderId, userHistory);

      // Send the GPT-4 response back to the user
      sendMessage(senderId, { text: responseMessage }, pageAccessToken);

    } catch (error) {
      console.error('Error communicating with OpenAI GPT-4:', error.message);
      sendMessage(senderId, { text: "I'm busy right now, please try again later." }, pageAccessToken);
    }
  }
};
