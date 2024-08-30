const axios = require("axios");

async function fetchAIGirlfriendResponse(prompt) {
    try {
        const response = await axios.get(`${global.NashBot.END}api/ai-gf?q=${encodeURIComponent(prompt)}`);
        if (response.data.status) {
            return response.data.result;
        } else {
            return "Failed to get a valid response from the AI Girlfriend.";
        }
    } catch (error) {
        console.error("Error fetching data:", error.message);
        return "Failed to fetch data. Please try again later.";
    }
}

module.exports = {
    name: "aigf",
    description: "Talk to the AI Girlfriend",
    nashPrefix: false,
    version: "1.0.0",
    role: 0,
    cooldowns: 5,
    aliases: ["aigf", "girlfriend"],
    execute(api, event, args, prefix) {
        const { threadID, messageID } = event;
        let prompt = args.join(" ");
        if (!prompt) return api.sendMessage("Please enter a prompt for the AI Girlfriend.", threadID, messageID);

        api.sendMessage(
            "[ 𝙰𝙸 𝙶𝙸𝚁𝙻𝙵𝚁𝙸𝙴𝙽𝙳 ]\n\n" +
            "⏳ Fetching the response...",
            threadID,
            async (err, info) => {
                if (err) return;
                try {
                    const response = await fetchAIGirlfriendResponse(prompt);
                    api.editMessage(
                        "[ 𝙰𝙸 𝙶𝙸𝚁𝙻𝙵𝚁𝙸𝙴𝙽𝙳 ]\n\n" +
                        response,
                        info.messageID
                    );
                } catch (g) {
                    api.sendMessage("Error processing your request: " + g.message, threadID);
                }
            },
            messageID
        );
    },
};
