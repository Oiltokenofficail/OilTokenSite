const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot("8220969072:AAEm7jP8-sST59N8b5z88OWPYtUK99ARzVM", {polling: true});
const CHAT_ID = "6244745468";

function notifyPayment(user, amount) {
  const message = `New purchase:\nUser: ${user}\nAmount of OIL: ${amount}`;
  bot.sendMessage(CHAT_ID, message);
}

// Example
notifyPayment("ExampleUser", 1000);
