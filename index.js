require("dotenv").config();
const express = require("express");
const app = express();
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const API_KEY = process.env.API_KEY;
const token = process.env.TOKEN;

//GET REQUESTS
app.get("/", (request, response) => {
  response.send("<h1>Hello,this is my telegram bot.</h1>");
});

const wakeup = () => {
  console.log("wakeup");
  axios
    .get(process.env.MYBACKENDURL)
    .then(function (response) {
      // handle success
      console.log(response);
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    });
};

// Created instance of TelegramBot
const bot = new TelegramBot(token, {
  polling: true,
});

// Listener (handler) for telegram's /info event
bot.onText(/\/info/, (msg, match) => {
  wakeup();
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Bot By Sibesh Behera\nhttps://github.com/sibesh1");
});

// Listener (handler) for telegram's /start event
bot.onText(/\/start/, (msg, match) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    "You can use this bot by typing in the below specified format:\n1)/info-Gives info of owner of this bot.\n2)/current Enter the name of location - Gives current weather details of the location.\n3)/forecast Enter the name of location - Gives weather forecast of the location.\n4)/usegps - Give access to your location and I will tell your weather accordingly."
  );
});

// Listener (handler) for telegram's /location event
bot.onText(/\/current/, (msg, match) => {
  const chatId = msg.chat.id;
  //console.log(match);
  const location = match.input.split(" ")[1];
  const weatherurl = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${location}`;
  //console.log(location);
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  if (location === undefined) {
    bot.sendMessage(chatId, "Please provide a valid location!");
    return;
  }

  let data = [];

  axios
    .get(weatherurl)
    .then(function (response) {
      // handle success
      data = response.data;
      //   console.log(
      //     `Your location is ${data.location.name},${data.location.country}.\nThe current temperature is ${data.current.temp_c}C and feelslike ${data.current.feelslike_c}C.\nThe windspeed is ${data.current.wind_kph}kph.`
      //   );
      bot.sendMessage(
        chatId,
        `Your location is ${data.location.name},${data.location.country}.\nThe current temperature is ${data.current.temp_c}\u00B0C and feels like ${data.current.feelslike_c}\u00B0C.\nThe windspeed is ${data.current.wind_kph}kph.`
      );
    })
    .catch(function (error) {
      // handle error
      console.log(error);
      bot.sendMessage(chatId, "Some error occurred.I will rectify it soon.");
    });
});

// Keyboard layout for requesting phone number access
const requestPhoneKeyboard = {
  reply_markup: {
    one_time_keyboard: true,
    keyboard: [
      [
        {
          text: "My phone number",
          request_contact: true,
          one_time_keyboard: true,
        },
      ],
      ["Cancel"],
    ],
  },
};

// Listener (handler) for retrieving phone number
bot.onText(/^\/usegps/, function (msg, match) {
  var option = {
    parse_mode: "Markdown",
    reply_markup: {
      one_time_keyboard: true,
      keyboard: [
        [
          {
            text: "My location",
            request_location: true,
          },
        ],
        ["Cancel"],
      ],
    },
  };
  bot
    .sendMessage(msg.chat.id, "Can we have your gps location?", option)
    .then(() => {
      bot.once("location", (msg1) => {
        bot.sendMessage(
          msg1.chat.id,
          "Thanks,your gps coordinates are: " +
            msg1.location.longitude +
            " " +
            msg1.location.latitude
        );
      });
    });
});

app.listen(process.env.PORT || 3000);
