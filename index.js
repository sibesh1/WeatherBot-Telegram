require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");

const token = process.env.TOKEN;

// Created instance of TelegramBot
const bot = new TelegramBot(token, {
  polling: true,
});

// Listener (handler) for telegram's /info event
bot.onText(/\/info/, (msg, match) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Bot By Sibesh Behera");
});

// Listener (handler) for telegram's /location event
bot.onText(/\/location/, (msg, match) => {
  const chatId = msg.chat.id;
  console.log(match);
  const location = match.input.split(" ")[1];
  console.log(location);
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  if (location === undefined) {
    bot.sendMessage(chatId, "Please provide a valid location!");
    return;
  }

  bot.sendMessage(chatId, `You enetred ${location}`);
});
