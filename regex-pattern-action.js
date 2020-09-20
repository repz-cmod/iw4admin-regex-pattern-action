var footer = {"text": "Regex Pattern Action | v1.0 | By Repz Sep"} //footer, change it to your server information if you want

var plugin = {
    author: 'sepehr-gh',
    version: 1.0,
    name: 'Regex Pattern Action',
    logger: null,
    manager: null,

    onEventAsync: function (gameEvent, server) {
        
    },

    onLoadAsync: function (manager) {
        this.manager = manager;
        this.logger = manager.GetLogger(0);
    },

    onUnloadAsync: function () {
    },

    onTickAsync: function (server) {
    }
};