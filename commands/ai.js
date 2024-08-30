const axios = require('axios');

module.exports = {
    name: 'ai',
    description: 'Interact with GPT-3.5 Turbo',
    cooldown: 3,
    nashPrefix: false,
    execute: async (api, event, args) => {
        const input = args.join(' ');
        const uid = event.senderID;

        if (!input) {
            return api.sendMessage('Please enter a prompt.', event.threadID, event.messageID);
        }

        api.sendMessage('Processing your request...', event.threadID, event.messageID);

        try {
            const response = await axios.get(`${global.NashBot.END}new/gpt-3_5-turbo?prompt=${encodeURIComponent(input)}`);
            const result = response.data.result.reply;

            if (!result) {
                throw new Error('No valid response received from the API.');
            }

            api.sendMessage(
                `•| 🤖 𝙷𝙾𝙼𝙴𝚁 𝙰𝙸 𝙱𝙾𝚃 |•\n\n${result}\n\n•| 𝙾𝚆𝙽𝙴𝚁 : 𝙷𝙾𝙼𝙴𝚁 𝚁𝙴𝙱𝙰𝚃𝙸𝚂 |•`,
                event.threadID,
                event.messageID
            );
        } catch (error) {
            api.sendMessage(`An error occurred: ${error.message}`, event.threadID, event.messageID);
        }
    },
};
