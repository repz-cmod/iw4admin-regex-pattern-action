var footer = {"text": "Regex Pattern Action | v1.0 | By Repz Sep"} //footer, change it to your server information if you want

var plugin = {
    author: 'sepehr-gh',
    version: 1.0,
    name: 'Regex Pattern Action',
    logger: null,
    manager: null,

    getPenalty: function(message){
        //todo: check patterns map

        return {hasPenalty: false, action: null, message: '', timespan: ''};
    },

    handlePenalty: function(action, message, timespan, origin){
        const lowerCasedAction = action.toLowerCase();
        switch (lowerCasedAction){
            case "warn":
                origin.Warn(message, _IW4MAdminClient);
                break;
            case "kick":
                origin.Kick(message, _IW4MAdminClient);
                break;
            case "ban":
            case "tempban":
                origin.TempBan(message, System.TimeSpan.Parse(timespan), _IW4MAdminClient);
                break;
            case "permban":
                origin.Ban(message, _IW4MAdminClient, false);
                break;
            default:
                this.logger.WriteWarning("Could not handle action: " + action)
                break;
        };
    },

    //handle a message
    onMessage: function(gameEvent, server){
        const message = gameEvent.Message;
        const penaltyObj = this.getPenalty(message);
        if(penaltyObj === undefined || !penaltyObj.hasPenalty)
            return;
        this.handlePenalty(penaltyObj.action, penaltyObj.message, penaltyObj.timespan, gameEvent.Origin);
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