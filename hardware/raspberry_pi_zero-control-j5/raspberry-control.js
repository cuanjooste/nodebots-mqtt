"use strict";
const five = require("johnny-five");
const Raspi = require("raspi-io");
const mqtt = require("mqtt");

const CONFIG = require("./config/local-config.js");
const CONTROLLER_ID = "03";

var console_prefix = "++ Raspberry Pi Zero Control - ";

var board = new five.Board({
  io: new Raspi()
});

board.on("ready", () => {
  let leds = [];
  leds.push(new five.Led('P1-11'));
  leds.push(new five.Led('P1-13'));
  leds.push(new five.Led('P1-15'));


  let host = CONFIG.host;
  let port = CONFIG.port;

  let client = mqtt.connect("mqtt://" + host + ":" + port);
  let baseTopic = "controller/" + CONTROLLER_ID + "/";
  let resultBaseTopic = "results/controller/" + CONTROLLER_ID + "/";

  client.on("connect", function () {
      console.log(console_prefix + "I'm connected to the MQTT server");
      let topicFilters = Array();
      for (let i = 1; i <= leds.length; i++) {
          topicFilters.push(baseTopic + "leds/" + i);
          console.log("Subscribed to " + baseTopic + "leds/" + i);
      }
      client.subscribe(topicFilters);
  })
   
  client.on('message', function (topic, message) {
      
      let messageObj = JSON.parse(message);
     
      console.log("Turn on LED -" + messageObj.id);

      leds[messageObj.id - 1].toggle();

  })

});