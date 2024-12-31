const fs = require('fs');

module.exports = {
  name: 'prefix',
  description: 'Replies with the prefix',
  nashPrefix: false,
  execute(api, event, args, prefix) {
    try {
      const message = `This, is my prefix [ 𓆩 '${prefix}'  𓆩]\n\n 𝗕𝗢𝗧𝗦𝗖𝗢𝗣𝗘 𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗦 𝗧𝗛𝗔𝗧 𝗠𝗔𝗬 𝗛𝗘𝗟𝗣 𝗬𝗢𝗨:\n➥ '${prefix}help [command] -> information and usage of command\n\n`;
      
      const imagePath = './josh.jpeg';

      
      if (fs.existsSync(imagePath)) {
        const attachment = fs.createReadStream(imagePath);
        api.sendMessage({ body: message, attachment }, event.threadID);
      } else {
        
        api.sendMessage(message, event.threadID);
      }
    } catch (error) {
      console.error('Error executing command:', error);
      api.sendMessage('An error occurred while executing the command.', event.threadID);
    }
  },
};
