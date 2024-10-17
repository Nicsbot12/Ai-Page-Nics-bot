const { sendMessage } = require('./sendMessage');

async function sendQuickReplies(senderId, pageAccessToken) {
  const quickReplies = [
    {
      content_type: "text",
      title: "Get Help",
      payload: "GET_HELP",
    },
    {
      content_type: "text",
      title: "Ask AI",
      payload: "ASK_AI",
    },
  ];

  await sendMessage(senderId, {
    text: "What would you like to do?",
    quick_replies: quickReplies,
  }, pageAccessToken);
}

module.exports = { sendQuickReplies };
