//config

const defaultMessage = "Behave!"; //default reason message

//defines messages by id to use in penalties
const messages = [
    {id: "1", message: "Template message"}
];

//penalties list
const penalties = [
    {regex: new RegExp(""), action: "", timespan: "", messageId: "1"},
];

// discord config
const discordConfig = {
    enable: false,
    webhookUrl: '',
    title: "**Player has faced a penalty**",
    footer: {"text": "Regex Pattern Action | v1.0 | By Repz Sep"}, //footer, change it to your server information if you want
    colorValue: 7506394,
    iw4adminUrlPrefix: '',
    forActions: ['ban', 'permban']
}


//plugin code here, do not make any changes unless you know what you are doing
var plugin = {
    author: 'sepehr-gh',
    version: 1.0,
    name: 'Regex Pattern Action',
    logger: null,
    manager: null,

    //cleans host name of server
    cleanHostname: function(hostname){
        var index = 0;
        do{
            index = hostname.indexOf("^");
            hostname = this.setCharAt(hostname, index, "");
            hostname = this.setCharAt(hostname, index, "");
        }while(index !== -1);

        return hostname;
    },

    //sends discord message about the ban
    handleDiscordMessage: function(penalty, message, server, origin){
        if(!discordConfig.enable || discordConfig.forActions.includes(penalty.action)) return;
        let cleanHostname = this.cleanHostname(server.Hostname);
        var embed = {
            "title": discordConfig.title,
            "description": "Player **" + origin.CleanedName + "** (["+origin.AliasLinkId+"]("+discordConfig.iw4adminUrlPrefix + origin.AliasLinkId+")) has sent a message that resulted with a penalty.\n" +
                            "Penalty Action: **"+ penalty.action +"**\n"+                
                            "Message: `"+ message +"`\n"+
                            "Server: **"+ cleanHostname+"**\n"+
                            "Client IP: **"+origin.IPAddressString+"**\n"+
                            "NetworkId (GUID): **"+origin.NetworkId+"**\n",
            "color": discordConfig.colorValue,
            "timestamp": new Date().toISOString(),
            "footer": discordConfig.footer
        }

        var embeds = []; embeds[0] = embed;
        var webhookData = {"embeds": embeds};
        
        try {
            var client = new System.Net.Http.HttpClient();
            client.DefaultRequestHeaders.Add("User-Agent", "iw4admin plugin");
            var content = new System.Net.Http.StringContent(JSON.stringify(webhookData), System.Text.Encoding.UTF8, "application/json");
            var result = client.PostAsync(discordConfig.webhookUrl, content).Result;
            result.Dispose();
            client.Dispose();
        } catch (error) {
            this.logger.WriteWarning('There was a problem sending message to discord ' + error.message);
        }
    },

    //loops through messages and get message with valid input id or returns the default message
    getMessageById: function(id){
        for(i = 0; i < messages.length; i++){
            if(id === messages[i].id)
                return messages[i].message;
        }

        return defaultMessage;
    },

    //get valid penalty for a message based on config file/data
    getPenalty: function(message){
        //todo: check patterns map
        for(i = 0; i < penalties.length; i++){
            var penalty = penalties[i];
            if(penalty.regex.exec(message) !== null){
                return {hasPenalty: true, action: penalty.action, message: this.getMessageById(penalty.messageId), timespan: penalty.timespan}; 
            }
        }
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
        if(gameEvent.Origin === undefined || gameEvent.Origin == null)
            return;
        const message = gameEvent.Message;
        const penaltyObj = this.getPenalty(message);
        if(penaltyObj === undefined || !penaltyObj.hasPenalty)
            return;
        this.handlePenalty(penaltyObj.action, penaltyObj.message, penaltyObj.timespan, gameEvent.Origin);
        this.handleDiscordMessage(penalty, message, server, gameEvent.Origin);
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