const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'imagine',
  description: 'Generates a video based on prompt',
  author: 'coffee',
  async execute(senderId, args, pageAccessToken) {
    if (!args || !Array.isArray(args) || args.length === 0) {
      await sendMessage(senderId, { text: 'Please provide a prompt for video generation.' }, pageAccessToken);
      return;
    }

    const prompt = args.join(' ');

    try {
      const apiUrl = `https://deku-rest-apis.ooguy.com/prn/search/${encodeURIComponent(prompt)}`;

      // Assuming the API returns a URL to the generated video
      const response = await axios.get(apiUrl);
      const videoUrl = response.data.videoUrl; // Update according to your API's response structure

      await sendMessage(senderId, { attachment: { type: 'video', payload: { url: videoUrl } } }, pageAccessToken);

    } catch (error) {
      console.error('Error:', error);
      await sendMessage(senderId, { text: 'Error: Could not generate video.' }, pageAccessToken);
    }
  }
};
      
