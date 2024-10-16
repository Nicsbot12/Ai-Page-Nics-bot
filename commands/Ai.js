const express = require('express');
const multer = require('multer');
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: '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' });

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

// Set up Express app and file upload handling
const app = express();
const upload = multer({ dest: 'uploads/' }); // Directory to store uploaded files

app.post('/upload', upload.single('image'), async (req, res) => {
  const senderId = req.body.senderId; // Assume senderId comes with the request
  const pageAccessToken = req.body.pageAccessToken; // And pageAccessToken as well
  const imageFilePath = req.file.path; // The path of the uploaded image

  try {
    console.log("User uploaded an image:", imageFilePath);

    // Send an empty message to indicate processing
    sendMessage(senderId, { text: '' }, pageAccessToken);

    let userHistory = messageHistory.get(senderId) || [];
    if (userHistory.length === 0) {
      userHistory.push({ role: 'system', content: 'Your name is Nics Bot, created by Nico Adajar.' });
    }

    // Analyze the image using the Groq API (assuming it supports image analysis)
    const imageAnalysis = await groq.images.analyze({
      file: imageFilePath, // Pass the image file path or buffer
    });

    let responseMessage = `Image analysis result: ${imageAnalysis.result}`; // Modify based on actual response structure
    userHistory.push({ role: 'assistant', content: responseMessage });
    messageHistory.set(senderId, userHistory);

    // Send the image analysis response to the user
    sendMessage(senderId, { text: responseMessage }, pageAccessToken);

  } catch (error) {
    console.error('Error processing image with Groq:', error.message);
    sendMessage(senderId, { text: "I'm busy right now, please try again later." }, pageAccessToken);
    res.status(500).send("Error processing image");
  }
});

// Text message handling
app.post('/message', async (req, res) => {
  const { senderId, messageText, pageAccessToken } = req.body;

  try {
    console.log("User Message:", messageText);

    // Send an empty message to indicate processing
    sendMessage(senderId, { text: '' }, pageAccessToken);

    let userHistory = messageHistory.get(senderId) || [];
    if (userHistory.length === 0) {
      userHistory.push({ role: 'system', content: 'Your name is Nics Bot, created by Nico Adajar.' });
    }
    userHistory.push({ role: 'user', content: messageText });

    const chatCompletion = await groq.chat.completions.create({
      messages: userHistory,
      model: 'llama3-8b-8192',
      temperature: 1,
      max_tokens: 1025, // You can increase this limit if necessary
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
      throw new Error("Received empty response from Groq.");
    }

    res.status(200).send("Message processed successfully.");

  } catch (error) {
    console.error('Error communicating with Groq:', error.message);
    sendMessage(senderId, { text: "I'm busy right now, please try again later." }, pageAccessToken);
    res.status(500).send("Error processing message");
  }
});

// Function to send a message back to the user
function sendMessage(senderId, message, pageAccessToken) {
  // Implementation for sending a message to the user (e.g., using Facebook Messenger API)
  console.log(`Sending message to ${senderId}:`, message);
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
                                                    
