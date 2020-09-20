var footer = {"text": "Regex Pattern Action | v1.0 | By Repz Sep"} //footer, change it to your server information if you want

var plugin = {
    author: 'sepehr-gh',
    version: 1.0,
    name: 'Regex Pattern Action',
    logger: null,
    manager: null,

    getPenalty: function(message){
        //todo: check patterns map

        return {hasPenalty: false, action: null, message: ''};
    },

    handlePenalty: function(action, origin){
        const lowerCasedAction = action.toLowerCase();
        switch (lowerCasedAction){
            case "warn":

                break;
            case "kick":

                break;
            case "ban":

                break;
            case "permban":

            break;
        };
    },

    //handle a message
    onMessage: function(gameEvent, server){
        const message = gameEvent.Message;
        const penaltyObj = this.getPenalty(message);
        if(penaltyObj === undefined || !penaltyObj.hasPenalty)
            return;
        this.handlePenalty(penaltyObj.action, penaltyObj.message, gameEvent.Origin);
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