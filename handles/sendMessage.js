const request = require('request');
const axios = require('axios')
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

  request({
    url: 'https://graph.facebook.com/v13.0/me/messages',
    qs: { access_token: pageAccessToken },
    method: 'POST',
    json: payload,
  }, (error, response, body) => {
    if (error) {
      console.error('Error sending message:', error);
    } else if (response.body.error) {
      console.error('Error response:', response.body.error);
    } else {
      console.log('Message sent successfully:', body);
    }
  });
}
async function sendMessage(recipientId, message, pageAccessToken) {
  try {
    await axios.post(`https://graph.facebook.com/v13.0/me/messages`, {
      recipient: { id: recipientId },
      message,
    }, {
      params: { access_token: pageAccessToken },
    });
  } catch (error) {
    console.error('Error sending message:', error.message);
  }
}

module.exports = { sendMessage };
