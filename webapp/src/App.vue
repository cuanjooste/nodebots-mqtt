<template>
    <div class="container">
        <div class="row">
            <app-header class="col-md-12"></app-header>
        </div>
        <div 
            v-for="(controller,controller_index) in controllers" 
            class="row component_row">
            
            <light-switch
                v-for="led in controller.leds"
                @lightToggle="lightToggle(controller.id,led)" 
                :key="led.id"
                class="col-md-2 component"
                :status="led.status">
            </light-switch>                
            
            <light-intensity-display 
                :lightIntensity="controller.lightIntensity"
                class="col-md-4 component"
                v-if="controller.lightIntensity != null"
                >
            </light-intensity-display>
            
        </div>
    </div>
</template>

<script>
    "use strict"
    import Header from './components/Header.vue';
    import LightSwitch from './components/LightSwitch.vue';
    import LightIntensityDisplay from './components/LightIntensityDisplay.vue';

    var hardwareControllers = require("./js/hardwareControllers.js");

    var console_prefix = "++ App.vue - ";

    export default {
        data: function () {
            return {
                controllers : hardwareControllers.controllers,
            }
        },
        components: {
            'app-header' : Header,
            'light-switch': LightSwitch,
            'light-intensity-display' : LightIntensityDisplay,
        },
        created : function()
        {
            console.log("Vue instance created");
            this.$mqtt.subscribe('results/controller/+/photoresistor')
            console.log(console_prefix + "Subscribed to results/+/photoresistor")

            this.$mqtt.on('message', (topic, message) => {
                let topic_array = topic.split("/");
                let payload = JSON.parse(message);
                this.updateLightIntensity(topic_array[2],payload);
            })
        },
        methods: {
            lightToggle(controller_id,led)
            {
                console.log(controller_id);
                led.status = !led.status;
                this.$mqtt.publish('controller/'+ controller_id +'/leds/' + led.id, JSON.stringify(led));
                console.log(console_prefix + "Sent -" + JSON.stringify(led) + " to controller/" + controller_id +'/leds/' + led.id);
            },
            updateLightIntensity(controller_id,payload)
            {
                let current_controller = this.findObjectByKey(this.controllers,"id",controller_id);
                current_controller.lightIntensity = payload.value;
            },
            findObjectByKey(array, key, value) 
            {
                for (let i = 0; i < array.length; i++) {
                    if (array[i][key] === value) {
                        return array[i];
                    }
                }
                return null;
            }
        }
    }
</script>

<style>
.container
{
    height: 100%;
    border-top:3rem #D1D1D1 solid;
    border-bottom:3rem #D1D1D1 solid;
    background-color: #ffffff;
}

.component_row
{
    height: 200px;
    padding: 1.5em;
}

.component
{ 
    margin:0.2em;
}
</style>
