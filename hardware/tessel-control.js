"use strict";
const five = require("johnny-five");
const Tessel = require("tessel-io");
const mqtt = require("mqtt");

const CONFIG = require("./config/local-config.js");

const console_prefix = "Tessel Control - ";

const board = new five.Board({
  io: new Tessel()
});


board.on("ready", () => {
    let led_1 = new five.Led("A7");
    let led_2 = new five.Led("A6");
    let led_3 = new five.Led("A5");

    let photoresistor = new five.Sensor({
        pin: "A4",
        freq: 2000
    }); 

    let host = CONFIG.host;
    let port = CONFIG.port;

    let client = mqtt.connect("mqtt://" + host + ":" + port);
    let ledCommandBaseTopic = "grow/leds/";
    let photoresistorResultBaseTopic = "grow/results/photoresistor/";

    client.on("connect", function () {
        console.log(console_prefix + "I'm connected to the MQTT server");
        let topicFilters = Array();
        for (let i = 1; i < 4; i++) {
            topicFilters.push(ledCommandBaseTopic + i);
            console.log("Subscribed to " + ledCommandBaseTopic + i);
        }
        client.subscribe(topicFilters);
    })
     
    client.on('message', function (topic, message) {
        // message is Buffer 
        let payloadString = message.toString();
        console.log("Message arrived for topic: " + topic + ", with the following payload: " + payloadString);
        
        let messageObj = JSON.parse(message);
        
        // Check if message anything the micro controller needs to respond too
        if (!topic.startsWith(ledCommandBaseTopic)) {
            return;
        }

        console.log("Turn on LED -" + messageObj.id);

        switch(messageObj.id) 
        {
            case 1:
                led_1.toggle();
                break;
            case 2:
                led_2.toggle();
                break;
            case 3:
                led_3.toggle();
        }
    })

    // EMIT COLLECTION
    photoresistor.on("data", function() {

        let resultMessagePayload = {
            "id": "1",
            "value": this.value,
        } 
        let resultMessagePayloadString = JSON.stringify(resultMessagePayload)
        client.publish(photoresistorResultBaseTopic, resultMessagePayloadString);
        console.log(console_prefix + "Sent to " + photoresistorResultBaseTopic + "this message - " + resultMessagePayloadString);
    });
});










