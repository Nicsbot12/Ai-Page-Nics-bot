const { sendMessage } = require('./sendMessage');

function handlePostback(event, pageAccessToken) {
  const senderId = event.sender.id;
  const payload = event.postback.payload;

  // Send a message back to the sender
  sendMessage(senderId, { text: `You sent a postback with payload: ${payload}` }, pageAccessToken);

  // Optionally, send quick replies in response to a specific postback
  if (payload === 'GET_HELP') {
    sendMessage(senderId, { text: "What can I help you with?" }, pageAccessToken);
  }
}

module.exports = { handlePostback };
