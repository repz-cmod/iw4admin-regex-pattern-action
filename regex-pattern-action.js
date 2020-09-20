var footer = {"text": "Regex Pattern Action | v1.0 | By Repz Sep"} //footer, change it to your server information if you want

var plugin = {
    author: 'sepehr-gh',
    version: 1.0,
    name: 'Regex Pattern Action',
    logger: null,
    manager: null,

    getPenalty: function(message){
        //todo: check patterns map

        return {hasPenalty: false, penalty: null, message: ''};
    },

    //handle a message
    onMessage: function(gameEvent, server){
        const message = gameEvent.Message;

    },

    onEventAsync: function (gameEvent, server) {
        if(gameEvent.Type === 15){ //client sent a message
            this.onMessage(gameEvent, server);
        }
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