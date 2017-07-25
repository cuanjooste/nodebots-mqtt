"use strict";
const five = require("johnny-five");
const mqtt = require("mqtt");

const CONFIG = require("./config/local-config.js");

const console_prefix = "Arduino Control - ";
const CONTROLLER_ID = "01";

const board = new five.Board();

board.on("ready", () => {

    let leds = [];
    leds.push(new five.Led("8"));
    leds.push(new five.Led("9"));
    leds.push(new five.Led("10"));

    let photoresistor = new five.Sensor({
        pin: "A4",
        freq: 2000
    }); 

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

    // EMIT COLLECTION
    photoresistor.on("data", function() {

        let resultMessagePayload = {
            "id": "1",
            "value": this.value,
        } 
        
        let resultMessagePayloadString = JSON.stringify(resultMessagePayload)
        client.publish(resultBaseTopic + "photoresistor", resultMessagePayloadString);
        console.log(console_prefix + "Sent to " + resultBaseTopic + "photoresistor this message - " + resultMessagePayloadString);
    });
});

