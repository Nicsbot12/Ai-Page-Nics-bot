const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'video',
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

      // Fetch the video URL from the API
      const response = await axios.get(apiUrl);
      const videoUrl = response.data.result; // Ensure this is the correct field from your API response

      if (!videoUrl) {
        await sendMessage(senderId, { text: 'Error: No video URL returned from the API.' }, pageAccessToken);
        return;
      }

      // Prepare the video attachment
      const videoPayload = {
        attachment: {
          type: 'video',
          payload: {
            url: videoUrl, // Ensure this is a direct link to the video
          },
        },
      };

      // Send the video message
      await sendMessage(senderId, videoPayload, pageAccessToken);
      
    } catch (error) {
      console.error('Error:', error);
      await sendMessage(senderId, { text: 'Error: Could not generate video. Please try again later.' }, pageAccessToken);
    }
  }
};
  
