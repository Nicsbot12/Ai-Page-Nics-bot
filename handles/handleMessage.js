const fs = require('fs');
const path = require('path');
const { sendMessage } = require('./sendMessage');
const { sendQuickReplies } = require('./sendQuickReplies'); // Ensure you import the function

const commands = new Map();
const prefix = '/';

// Load command files
const commandFiles = fs.readdirSync(path.join(__dirname, '../commands')).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`../commands/${file}`);
  commands.set(command.name.toLowerCase(), command);
}

async function handleMessage(event, pageAccessToken) {
  const senderId = event.sender.id;
  const messageText = event.message.text.trim();

  if (messageText.startsWith(prefix)) {
    const args = messageText.slice(prefix.length).split(' ');
    const commandName = args.shift().toLowerCase();

    if (commands.has(commandName)) {
      const command = commands.get(commandName);
      try {
        await command.execute(senderId, args, pageAccessToken, sendMessage);
      } catch (error) {
        console.error(`Error executing command ${commandName}:`, error);
        sendMessage(senderId, { text: 'There was an error executing that command.' }, pageAccessToken);
      }
    }
    return;
  }

  // If message is "/help", send quick replies
  if (messageText === '/help') {
    await sendQuickReplies(senderId, pageAccessToken);  // Call quick replies here
    return;
  }

  // Split the messageText into an array of arguments for the AI command
  const aiArgs = messageText.split(' ');
  const aiCommand = commands.get('ai');
  if (aiCommand) {
    try {
      await aiCommand.execute(senderId, aiArgs, pageAccessToken, sendMessage);
    } catch (error) {
      console.error('Error executing AI command:', error);
      sendMessage(senderId, { text: 'There was an error processing your request.' }, pageAccessToken);
    }
  }
}

module.exports = { handleMessage };
    
