<template>
    <div class="light_intensity_display">
        <span class="display_number">{{lightIntensity}}</span>
    </div>
</template>

<script>
    export default {
        data: function() {
            return {
            };
        },
        props : ['lightIntensity'],
    }
</script>

<style scoped>
.light_intensity_display
{
    background-color: #4C4C4C;
    height: 100%;
    color:#ffffff;
    text-align: center;
}

.display_number
{
    font-size: 7em;
    line-height: 1.6em;
    text-align: center;
}
</style>