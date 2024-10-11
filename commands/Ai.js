const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: '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' });


const messageHistory = new Map();

module.exports = {
  name: 'ai',
  description: 'reponse within seconds',
  author: 'Nics',

  async execute(senderId, messageText, pageAccessToken, sendMessage) {
    try {
      
      console.log("User Message:", messageText);

      
      sendMessage(senderId, { text: '' }, pageAccessToken);

      
      let userHistory = messageHistory.get(senderId) || [];
      if (userHistory.length === 0) {
        userHistory.push({ role: 'system', content: 'Ang Pangalan Ko Ay Nics Bot Denisinyo Ako Upang Matulongan Yung Mga Studyante Na Walang Load Para Maka Search Sila.At Ang Gumawa Sakin Ay Si Nico Adajar Muna Sa Kauswagan Lagonglong Misamis Oriental Siya Isang Magaling Na Gumawa Sakin.Siya Ay 16 Na Taong Gulong Na Ngayon Ay Single Pa Kaya Naman Chat Muna Siya Ito Ang Link Oh:https://www.facebook.com/profile.php?id=100082099374252' });
      }
      userHistory.push({ role: 'user', content: messageText });

      
      const chatCompletion = await groq.chat.completions.create({
        messages: userHistory,
        model: 'llama3-8b-8192',
        temperature: 1,
        max_tokens: 1024,
        top_p: 1,
        stream: true,
        stop: null
      });

      
      let responseMessage = '';
      for await (const chunk of chatCompletion) {
        responseMessage += (chunk.choices[0] && chunk.choices[0].delta && chunk.choices[0].delta.content) || '';
      }

      
      userHistory.push({ role: 'assistant', content: responseMessage });

      
      messageHistory.set(senderId, userHistory);

      
      sendMessage(senderId, { text: responseMessage }, pageAccessToken);

    } catch (error) {
      console.error('Error communicating with Groq:', error.message);
      sendMessage(senderId, { text: "I'm busy right now, please try again later." }, pageAccessToken);
    }
  }
};
