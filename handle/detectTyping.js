async function detectTyping(api, event) {
  if (event.type == "typ") {
    if (event.isTyping == true) {
       // api.shareLink("This user is typing", "https://facebook.com/" + event.from, event.threadID)
      api.sendTypingIndicator(event.threadID, (err) => {
        if (err) return console.error(err);
      }, true)
    } else {
      // stop the typing indicator
      api.sendTypingIndicator(event.threadID, false);
    }
  }
}
module["exports"] = detectTyping;