const request = require('request');
const axios = require('axios'); // Add axios for the typing indicator

async function typingIndicator(senderId, pageAccessToken) {
  try {
    await axios.post(`https://graph.facebook.com/v13.0/me/messages`, {
      recipient: { id: senderId },
      sender_action: 'typing_on',
    }, {
      params: { access_token: pageAccessToken },
    });
  } catch (error) {
    console.error('Error sending typing indicator:', error.message);
  }
}

async function sendMessage(senderId, message, pageAccessToken) {
  if (!message || (!message.text && !message.attachment && !message.quick_replies)) {
    console.error('Error: Message must provide valid text, attachment, or quick replies.');
    return;
  }

  // Show typing indicator before sending the message
  await typingIndicator(senderId, pageAccessToken);

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

  // Add quick replies to the payload if provided
  if (message.quick_replies) {
    payload.message.quick_replies = message.quick_replies;
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

module.exports = { sendMessage };
