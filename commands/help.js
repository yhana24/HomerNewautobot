module.exports = {
    name: "help",
    description: "Beginner's Guide To All Bot Commands and Events",
    nashPrefix: false,
    version: "1.0.2",
    role: 0,
    cooldowns: 7,
    aliases: ["help"],
    execute(api, event, args, prefix) {
        const commands = global.NashBoT.commands;
        const events = global.NashBoT.events;
        const { threadID, messageID } = event;

        const itemsPerPage = 20;
        let pageNumber = args[0] ? parseInt(args[0], 10) : 1;
        pageNumber = isNaN(pageNumber) || pageNumber < 1 ? 1 : pageNumber;

        let commandList = "╔════ஜ۩۞۩ஜ═══╗\n\n";
        commandList += `📗𝗕𝗼𝘁𝘀𝗰𝗼𝗽𝗲 𝗔𝘃𝗮𝗶𝗹𝗮𝗯𝗹𝗲 𝗰𝗼𝗺𝗺𝗮𝗻𝗱𝘀 - 𝑷𝒂𝒈𝒆 ${pageNumber}:\n\n`;

        const commandEntries = Array.from(commands.keys());
        const eventEntries = Array.from(events.keys());

        const allEntries = [...commandEntries, ...eventEntries];
        const startIndex = (pageNumber - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedEntries = allEntries.slice(startIndex, endIndex);

        let isCommandSection = true;

        paginatedEntries.forEach(name => {
            if (commandEntries.includes(name)) {
                commandList += `❍ ${name}\n`;
            } else if (eventEntries.includes(name)) {
                if (isCommandSection) {
                    commandList += "\nEvent List:\n";
                    isCommandSection = false;
                }
                commandList += `❍ ${name}\n`;
            }
        });

        if (paginatedEntries.length < itemsPerPage && pageNumber > 1) {
            commandList += "\nNo more commands/events.";
        }

        commandList += `\n\n𝑱𝒖𝒔𝒕 𝒎𝒆𝒔𝒔𝒶𝑔𝒺 𝒽𝒺𝓁𝓅 1, 2, 𝑜𝓇 3 𝓉𝑜 𝓈𝑒𝑒 𝓂𝑜𝓇𝑒 𝒸𝑜𝓂𝒶𝓃𝒹𝓈\n`;
        commandList += `╚════ஜ۩۞۩ஜ═══╝`;
        api.sendMessage(commandList, threadID, messageID);
    }
};
