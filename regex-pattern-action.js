//config
const messages = [
    {id: "1", message: "Template message"}
]

const penalties = [
    {regex: "", action: "", timespan: "", messageId: "1"},
]


var plugin = {
    author: 'sepehr-gh',
    version: 1.0,
    name: 'Regex Pattern Action',
    logger: null,
    manager: null,

    //get valid penalty for a message based on config file/data
    getPenalty: function(message){
        //todo: check patterns map

        return {hasPenalty: false, action: null, message: '', timespan: ''};
    },

    //handle penalty based on action and timestamp
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