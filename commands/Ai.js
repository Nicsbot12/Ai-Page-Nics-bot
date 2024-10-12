const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: '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' });

const messageHistory = new Map();
const maxMessageLength = 2000;  // Set the maximum message length

// Function to split a long message into chunks
function splitMessageIntoChunks(text, maxLength) {
  const chunks = [];
  for (let i = 0; i < text.length; i += maxLength) {
    chunks.push(text.substring(i, i + maxLength));
  }
  return chunks;
}

module.exports = {
  name: 'ai',
  description: 'Response within seconds',
  author: 'Nics',

  async execute(senderId, messageText, pageAccessToken, sendMessage) {
    console.log("User Message:", messageText);

    // Send an initial response to the user
    sendMessage(senderId, { text: '' }, pageAccessToken);

    try {
      // Initialize user history
      let userHistory = messageHistory.get(senderId) || [];
      if (userHistory.length === 0) {
        userHistory.push({
          role: 'system',
          content: 'Your name is Nics Bot and you were created by Nico Adajar'
        });
      }
      userHistory.push({ role: 'user', content: messageText });

      // Check if the message exceeds the maximum length
      let responseMessage = '';
      if (messageText.length > maxMessageLength) {
        const messages = splitMessageIntoChunks(messageText, maxMessageLength);
        for (const message of messages) {
          const chatCompletion = await groq.chat.completions.create({
            messages: [...userHistory, { role: 'user', content: message }],
            model: 'llama3-8b-8192',
            temperature: 1,
            max_tokens: 1024,
            top_p: 1,
            stream: true,
            stop: null
          });

          // Collect the response message for each chunk
          for await (const chunk of chatCompletion) {
            const content = chunk.choices[0]?.delta?.content || '';
            responseMessage += content;
          }
        }
      } else {
        // Request chat completion from Groq for normal message length
        const chatCompletion = await groq.chat.completions.create({
          messages: userHistory,
          model: 'llama3-8b-8192',
          temperature: 1,
          max_tokens: 1024,
          top_p: 1,
          stream: true,
          stop: null
        });

        // Collect the response message
        for await (const chunk of chatCompletion) {
          const content = chunk.choices[0]?.delta?.content || '';
          responseMessage += content;
        }
      }

      // Update user history with the assistant's response
      userHistory.push({ role: 'assistant', content: responseMessage });
      messageHistory.set(senderId, userHistory);

      // Send the final response to the user
      sendMessage(senderId, { text: responseMessage }, pageAccessToken);

    } catch (error) {
      console.error('Error communicating with Groq:', error.message);
      sendMessage(senderId, { text: "I'm busy right now, please try again later." }, pageAccessToken);
    }
  }
};
          
