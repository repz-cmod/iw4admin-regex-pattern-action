//config

const defaultMessage = "Behave!"; //default reason message

//defines messages by id to use in penalties
const messages = [
    {id: "1", message: "You are such an asshole"}
];

//penalties list
const penalties = [
    {regex: /^(?=.*\b(rekt)\b)(?=.*\bBy\b)(?=.*\bExodus\b).+/gm, action: "permban", timespan: "", messageId: "1"},
];

// discord config
const discordConfig = {
    enable: false,
    webhookUrl: '',
    title: "**Player has faced a penalty**",
    footer: {"text": "Flagged User Discord Tracker | v1.0 | By Repz Sep"}, //footer, change it to your server information if you want
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
            console.log("Testing regex " + i + " for message " + message)
            if(penalty.regex.exec(message) !== null){
                console.log("matched");
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
                origin.Warn(message, "_IW4MAdminClient");
                break;
            case "kick":
                origin.Kick(message, "_IW4MAdminClient");
                break;
            case "ban":
            case "tempban":
                origin.TempBan(message, timespan, "_IW4MAdminClient");
                break;
            case "permban":
                origin.Ban(message, "_IW4MAdminClient", false);
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



// --------- tests here ----------

// mock manager obj
var manager = {
    GetLogger: function(int){
        return {
            WriteWarning: function(message){
                console.log("WriteWarning");
            }
        }
    },
}


// mock server
var server = {
    Hostname: "A sample server"
}

// mock event
var gameEvent = {
    // mock Origin
    Origin: {
        Ban: function(message, admin, isEvade){
            console.log("Client banned. message: "+ message)
        },
    
        TempBan: function(message, timespan, admin){
            console.log("Client temporary("+timespan+") banned. message: "+ message)
        },
    
        Warn: function(message, admin){
            console.log("Client warned. message: "+ message)
        },
    
        Kick: function(message, admin, isEvade){
            console.log("Client kicked. message: "+ message)
        },
    
        CleanedName: "Test Client",
        AliasLinkId: 123,
        IPAddressString: "127.0.0.1"
    },

    Type: 15,

    Message: "^7Player ^1 NyashaG ^7Got rekt By ^5 Exodus^7 with a ^1BodyShot."
}

console.log("running test...");
// run test
plugin.onLoadAsync(manager);
plugin.onEventAsync(gameEvent, server);
console.log("finished running test");