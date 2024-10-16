const fs = require('fs');
const path = require('path');
const { sendMessage } = require('./utils/sendMessage');

const commands = new Map();

// Load command files
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.set(command.name.toLowerCase(), command);
}

async function handleMessage(event, pageAccessToken) {
  const senderId = event.sender.id;
  const messageText = event.message.text.trim();

  // Check if the message is a command
  const args = messageText.split(' '); // Split the message into arguments
  const commandName = args.shift().toLowerCase(); // Get the command name

  // If the command exists, execute it
  if (commands.has(commandName)) {
    const command = commands.get(commandName);
    try {
      await command.execute(senderId, args, pageAccessToken, sendMessage);
    } catch (error) {
      console.error(`Error executing command ${commandName}:`, error);
      sendMessage(senderId, { text: 'There was an error executing that command.' }, pageAccessToken);
    }
    return;
  }

  // Directly send the entire message text to GPT-4 if it's not a recognized command
  const aiCommand = commands.get('gpt4'); // Assuming 'gpt4' is the name of your command
  if (aiCommand) {
    try {
      await aiCommand.execute(senderId, [messageText], pageAccessToken, sendMessage);
    } catch (error) {
      console.error('Error executing AI command:', error);
      sendMessage(senderId, { text: 'There was an error processing your request.' }, pageAccessToken);
    }
  }
}

module.exports = { handleMessage };
        
