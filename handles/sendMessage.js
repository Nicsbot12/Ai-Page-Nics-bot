const axios = require('axios');

/**
 * Sends a message via Facebook Messenger API.
 * @param {string} senderId - The ID of the recipient.
 * @param {Object} message - The message object to send.
 * @param {string} [message.text] - The text of the message (optional).
 * @param {Object} [message.attachment] - The attachment object (optional).
 * @param {string} pageAccessToken - The access token for the Facebook page.
 * @returns {Promise<void>} A promise that resolves when the message is sent.
 */
async function sendMessage(senderId, message, pageAccessToken) {
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

  try {
    const response = await axios.post(`https://graph.facebook.com/v13.0/me/messages`, payload, {
      params: { access_token: pageAccessToken },
    });
    console.log('Message sent successfully:', response.data);
  } catch (error) {
    console.error('Error sending message:', error.message);
  }
}

module.exports = { sendMessage };
