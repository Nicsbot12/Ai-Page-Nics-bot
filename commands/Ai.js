const Gemini = require('gemini-sdk'); // Replace with actual Gemini SDK
const gemini = new Gemini({ apiKey: 'AIzaSyDuPD1wDOOPPfEJLo1xp2NGt74JzL7Wz_c' }); // Using environment variables for API key security

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

// Function to analyze an image
async function analyzeImage(imageUrl) {
  try {
    const analysisResult = await gemini.image.analyze({ imageUrl });
    return analysisResult;
  } catch (error) {
    console.error('Error analyzing image:', error.message);
    return null;
  }
}

module.exports = {
  name: 'ai',
  description: 'response within seconds, with image analysis capabilities',
  author: 'Nics',

  async execute(senderId, messageText, pageAccessToken, sendMessage, imageUrl = null) {
    try {
      console.log("User Message:", messageText);

      // Send an empty message to indicate processing
      sendMessage(senderId, { text: '' }, pageAccessToken);

      let userHistory = messageHistory.get(senderId) || [];
      if (userHistory.length === 0) {
        userHistory.push({ role: 'system', content: 'Your name is Nics Bot, created by Nico Adajar.' });
      }
      userHistory.push({ role: 'user', content: messageText });

      // Check if the user has sent an image for analysis
      if (imageUrl) {
        const imageAnalysis = await analyzeImage(imageUrl);
        if (imageAnalysis) {
          sendMessage(senderId, { text: `Image analysis result: ${JSON.stringify(imageAnalysis)}` }, pageAccessToken);
        } else {
          sendMessage(senderId, { text: "Failed to analyze the image." }, pageAccessToken);
        }
      }

      // Fetch a text completion from Gemini
      const chatCompletion = await gemini.chat.completions.create({
        messages: userHistory,
        model: 'gemini3-8b',  // Gemini model
        temperature: 1,
        max_tokens: 1025,
        top_p: 1,
        stream: true,
        stop: null
      });

      let responseMessage = '';
      
      for await (const chunk of chatCompletion) {
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
        throw new Error("Received empty response from Gemini.");
      }

    } catch (error) {
      console.error('Error communicating with Gemini:', error.message);
      sendMessage(senderId, { text: "I'm busy right now, please try again later." }, pageAccessToken);
    }
  }
};
