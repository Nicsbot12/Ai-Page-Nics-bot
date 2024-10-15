const vision = require('@google-cloud/vision');

module.exports = {
  name: 'visionCloud',
  description: 'Analyze an image using Google Vision API',
  author: 'Deku (Google Vision API)',

  async execute(senderId, args, pageAccessToken, sendMessage) {
    const imageUrl = args[0]; // Assume the first argument is the image URL
    if (!imageUrl) {
      sendMessage(senderId, { text: 'Please provide a valid image URL for analysis.' }, pageAccessToken);
      return;
    }

    // Initialize Google Cloud Vision client
    const client = new vision.ImageAnnotatorClient();

    try {
      // Perform label detection on the image using Google Vision API
      const [result] = await client.labelDetection({ image: { source: { imageUri: imageUrl } } });
      const labels = result.labelAnnotations.map(label => label.description).join(', ');

      if (!labels) {
        sendMessage(senderId, { text: 'No labels detected in the image.' }, pageAccessToken);
      } else {
        sendMessage(senderId, { text: `Image labels detected: ${labels}` }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error analyzing image with Google Vision API:', error);

      let errorMessage = 'An error occurred while analyzing the image.';
      if (error.code === 3) {  // Invalid URL or inaccessible image
        errorMessage = 'The image URL is invalid or the image is not publicly accessible.';
      } else if (error.code === 7) {  // Request limit exceeded or network error
        errorMessage = 'Failed to connect to the Google Vision API. Please try again later.';
      }

      sendMessage(senderId, { text: errorMessage }, pageAccessToken);
    }
  }
};
        
