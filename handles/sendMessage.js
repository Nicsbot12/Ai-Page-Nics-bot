const request = require('request');

function sendMessage(senderId, message, pageAccessToken) {
  if (!message || (!message.text && !message.attachment)) {
    console.error('Error: Message must provide valid text or attachment.');
    return;
  }

  const payload = {
    recipient: { id: senderId },
    message: {}
  };

  if (message.text) {
    payload.message.text = message.text;
  }

  if (message.attachment) {
    payload.message.attachment = message.attachment;
  }

  console.log(`Sending message to ${senderId}:`, payload);

  request({
    url: 'https://graph.facebook.com/v13.0/me/messages',
    qs: { access_token: pageAccessToken },
    method: 'POST',
    json: payload,
  }, (error, response, body) => {
    if (error) {
      console.error('Error sending message:', error);
    } else {
      if (response.statusCode !== 200) {
        console.error('Error response:', body.error || response.statusMessage);
      } else {
        console.log('Message sent successfully:', body);
      }
    }
  });
}

// Function to simulate typing indicator (you'll need to implement this)
async function typingIndicator(senderId) {
  const payload = {
    recipient: { id: senderId },
    sender_action: 'typing_on'
  };

  console.log(`Sending typing indicator to ${senderId}:`, payload);
  // Here you would send the typing indicator (implement the request similar to sendMessage)
}

// Function to handle incoming messages
async function handleMessage(senderId, message, pageAccessToken) {
  await typingIndicator(senderId);
  
  // Simulate some delay to mimic typing
  setTimeout(async () => {
    // Your logic to send a response goes here
    await sendMessage(senderId, { text: 'Here is your response!' }, pageAccessToken); // Call sendMessage with the response
  }, 2000); // 2-second delay
}

module.exports = { sendMessage, handleMessage };
    
