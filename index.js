const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const { Prodia } = require("prodia.js");
const login = require("fca-deku");
const fs = require("fs");
const config = __dirname + "/config.json";
const setting = JSON.parse(fs.readFileSync(config, "utf8"));
const app = express();

const PORT = process.env.PORT || 3000;

let activeSessions = 0;
app.use(bodyParser.json());
app.use(express.static("public"));

global.NashBoT = new Object({
  commands: new Map(),
  events: new Map(),
  onlineUsers: new Map(),
});

global.NashBot = new Object({
  AUTOPOSt: setting["AUTOPOST"],
  ENDPOINT: "https://nash-rest-api-production.up.railway.app/",
  END: "https://deku-rest-api.gleeze.com/",
  KEN: "https://api.kenliejugarap.com/"
});

async function loadCommands() {
  const commandPath = path.join(__dirname, "commands");
  const commandFiles = fs
    .readdirSync(commandPath)
    .filter((file) => file.endsWith(".js"));

  commandFiles.forEach((file) => {
    const cmdFile = require(path.join(commandPath, file));

    if (!cmdFile) {
      console.error(`File: ${file} does not export anything!`);
    } else if (!cmdFile.name) {
      console.error(`File: ${file} does not export a name!`);
    } else if (!cmdFile.execute) {
      console.error(`File ${file} does not export an execute function!`);
    } else {
      global.NashBoT.commands.set(cmdFile.name, cmdFile);
    }
  });
}

async function loadEvents() {
  const eventPath = path.join(__dirname, "events");
  const eventFiles = fs
    .readdirSync(eventPath)
    .filter((file) => file.endsWith(".js"));

  eventFiles.forEach((file) => {
    const evntFile = require(path.join(eventPath, file));

    if (!evntFile) {
      console.error(`File: ${file} does not export anything!`);
    } else if (!evntFile.name) {
      console.error(`File: ${file} does not export a name!`);
    } else if (!evntFile.onEvent) {
      console.error(`File ${file} does not export an execute function!`);
    } else {
      global.NashBoT.events.set(evntFile.name, evntFile);
    }
  });
}

loadEvents();
loadCommands();

app.post("/login", (req, res) => {
  const { botState, prefix } = req.body;

  try {
    const appState = JSON.parse(botState);
    login({ appState }, (err, api) => {
      if (err) {
        console.error("Failed to login:", err);
        return res.status(500).send("Failed to login");
      }

      const cuid = api.getCurrentUserID();
      global.NashBoT.onlineUsers.set(cuid, {
        userID: cuid,
        prefix: prefix,
      });

      setupBot(api, prefix);
      res.sendStatus(200);
    });
  } catch (error) {
    console.error("Error parsing appState:", error);
    res.status(400).send("Invalid appState");
  }
});

function setupBot(api, prefix) {
  //api.setOptions({ listenEvents: true });
  api.setOptions({
    forceLogin: false,
    listenEvents: true,
    logLevel: "error",
    selfListen: false,
    online: true,
    autoMarkDelivery: false,
    autoMarkRead: false,
    userAgent:
      "Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36 OPR/84.0.4316.21",
  });
  require(__dirname + "/handle/autoPost")(api)
  api.listenMqtt((err, event) => {
    if (err) {
      console.error("Error listening for messages:", err);
      return;
    }
    require(__dirname + "/handle/detectTyping")(api, event);
    try {
      /*if (event.type === "message") {
        handleMessage(api, event, prefix);
      } else if (event.type === "event") {
        handleEvent(api, event, prefix);
      }*/
      if (event.body != null) {
        handleMessage(api, event, prefix);
        handleEvent(api, event, prefix);
      }
    } catch (error) {
      console.error("Error handling event:", error);
    }
  });
}

async function handleEvent(api, event, prefix) {
  const { events } = global.NashBoT;
  try {
    for (const { name, onEvent } of events.values()) {
      if (event && name) {
        const args = event.body?.split("");
        await onEvent({ prefix, api, event, args });
      }
    }
  } catch (error) {
    console.error(error);
  }
}

async function handleMessage(api, event, prefix) {
  if (!event.body) return;
  let [command, ...args] = event.body.trim().split(" ");

  if (command.startsWith(prefix)) {
    command = command.slice(prefix.length);
  }

  if (event.body) {
    try {
      const cmdFile = global.NashBoT.commands.get(command.toLowerCase());

      if (cmdFile) {
        const nashPrefix = cmdFile.nashPrefix !== false;
        if (nashPrefix && !event.body.toLowerCase().startsWith(prefix)) {
          return;
        }

        try {
          cmdFile.execute(api, event, args, prefix);
        } catch (error) {
          api.sendMessage(
            `An error occurred while running command: ${command}\n\nMessage: ${error.message}\nErrorType: ${error.name}\nStack: ${error.stack}`,
            event.threadID,
            event.messageID,
          );
        }
      }
    } catch (error) {
      console.error(error);
    }
  } else if (event.body?.startsWith(prefix)) {
    api.sendMessage(
      `The command ${command ? `"${command}"` : "that you are using"} doesn't exist, use ${botPrefix}help to view available commands.`,
      event.threadID,
      event.messageID,
    );
  }
}

function listCommands(api, threadID) {
  let message = "Total Commands: " + commands.size + "\n\n";

  commands.forEach((command, name) => {
    message += `Command: ${name}\nDescription: ${command.description}\n\n`;
  });

  api.sendMessage(message, threadID);
}

app.get("/active-sessions", async (req, res) => {
  let json = {};
  for (let [uid, { userID, prefix }] of global.NashBoT.onlineUsers) {
    json[uid] = { userID, prefix };
  }

  res.json(json);
});

app.get("/commands", (req, res) => {
  const commands = {};
  global.NashBoT.commands.forEach((command, name) => {
    commands[name] = {
      description: command.description || "No description available",
    };
  });
  res.json(commands);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});