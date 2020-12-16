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

// Created instance of TelegramBot
const bot = new TelegramBot(token, {
  polling: true,
});

// Listener (handler) for telegram's /info event
bot.onText(/\/info/, (msg, match) => {
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

// Listener (handler) for telegram's /forecast event
bot.onText(/\/forecast/, (msg, match) => {
  const chatId = msg.chat.id;
  const location = match.input.split(" ")[1];
  const weatherurl = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${location}&days=3`;

  if (location === undefined) {
    bot.sendMessage(chatId, "Please provide a valid location!");
    return;
  }

  axios
    .get(weatherurl)
    .then(function (response) {
      // handle success
      const data = response.data.forecast.forecastday;
      let reply = "";
      // console.log(data);
      data.forEach((element) => {
        //console.log(element.date);
        const temp = `Date:${element.date}  MAXTEMP:${element.day.maxtemp_c}\u00B0C , MINTEMP:${element.day.mintemp_c}\u00B0C , HUMIDITY:${element.day.avghumidity}%, MAXWIND:${element.day.maxwind_kph}kph`;
        //console.log(temp);
        reply += temp + "\n";
        //console.log(reply);
      });
      //console.log(reply);
      bot.sendMessage(chatId, reply);
    })
    .catch(function (error) {
      // handle error
      bot.sendMessage(chatId, "Some error occurred.I will rectify it soon.");
      console.log(error);
    });
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

  axios
    .get(weatherurl)
    .then(function (response) {
      // handle success
      const data = response.data;
      //   console.log(
      //     `Your location is ${data.location.name},${data.location.country}.\nThe current temperature is ${data.current.temp_c}C and feelslike ${data.current.feelslike_c}C.\nThe windspeed is ${data.current.wind_kph}kph.`
      //   );
      bot.sendMessage(
        chatId,
        `The location you entered is ${data.location.name},${data.location.region},${data.location.country}.\nThe current temperature is ${data.current.temp_c}\u00B0C and feels like ${data.current.feelslike_c}\u00B0C.\nThe windspeed is ${data.current.wind_kph}kph and humidity is ${data.current.humidity}%.`
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
        const latitude = msg1.location.latitude;
        const longitude = msg1.location.longitude;
        const url = `https://api.weatherapi.com/v1/forecast.json?key=3ee033d3cdf049978ba60804200312&q=${latitude},${longitude}`;

        axios
          .get(url)
          .then(function (response) {
            // handle success
            const data = response.data;
            //   console.log(
            //     `Your location is ${data.location.name},${data.location.country}.\nThe current temperature is ${data.current.temp_c}C and feelslike ${data.current.feelslike_c}C.\nThe windspeed is ${data.current.wind_kph}kph.`
            //   );
            const reply = `The location you entered is ${data.location.name},${data.location.region},${data.location.country}.\nThe current temperature is ${data.current.temp_c}\u00B0C and feels like ${data.current.feelslike_c}\u00B0C.\nThe windspeed is ${data.current.wind_kph}kph and humidity is ${data.current.humidity}%.`;
            //console.log(reply);
            bot.sendMessage(msg1.chat.id, reply);
          })
          .catch(function (error) {
            // handle error
            bot.sendMessage(
              chatId,
              "Some error occurred.I will rectify it soon."
            );
            console.log(error);
          });
      });
    });
});

app.listen(process.env.PORT || 3000);
