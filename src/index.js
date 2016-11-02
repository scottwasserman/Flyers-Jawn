/**
    Copyright 2016 Scott L. Wasserman. All Rights Reserved.
*/

/**
 * Messages
 */
var ERROR_MESSAGES = [
    "Dang!",
    "Bummer!",
    "Well that sucks!",
    "Doh!",
    "Dude, Really!",
    "What the!"
];

var WIN_MESSAGES = [
    "Yes!",
    "Alright, Alright, Alright!",
    "Philly in the house!",
    "Philly won up in here!",
    "In your face!",
    "Go Philly!"
];

var LOSE_MESSAGES = [
    "We'll get them next time!",
    "Dang!",
    "Come on Philly!",
    "Sucks!",
    "What the heck!",
    "Disapointing!"
];

/**
 * App ID for the skill
 */
var APP_ID = undefined; //OPTIONAL: replace with "amzn1.echo-sdk-ams.app.[your-unique-value-here]";

/**
 * The AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');

var Skill = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
Skill.prototype = Object.create(AlexaSkill.prototype);
Skill.prototype.constructor = Skill;

Skill.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    //console.log("onSessionStarted requestId: " + sessionStartedRequest.requestId + ", sessionId: " + session.sessionId);
    // any initialization logic goes here
};

Skill.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    //console.log("onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    handleHelpRequest(response);
};

/**
 * Overridden to show that a subclass can override this function to teardown session state.
 */
Skill.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    //console.log("onSessionEnded requestId: " + sessionEndedRequest.requestId + ", sessionId: " + session.sessionId);
    // any cleanup logic goes here
};

Skill.prototype.intentHandlers = {
    "WhatsUpIntent": function (intent, session, response) {
        handleWhatsUpRequest(response);
    },

    "AMAZON.HelpIntent": function (intent, session, response) {
        handleHelpRequest(response);
    },

    "AMAZON.StopIntent": function (intent, session, response) {
        var speechOutput = "Later";
        response.tell(speechOutput);
    },

    "AMAZON.CancelIntent": function (intent, session, response) {
        var speechOutput = "Later";
        response.tell(speechOutput);
    }
};

function handleHelpRequest(response) {
    response.ask("I'm a Flyers fan just like you. I'll be here to keep you update to date on the latest score. Just ask me what's up!");
}


function handleWhatsUpRequest(response) { 
    checkForCache(response);
}

function checkForCache(response) {
    var date_string = new Date().toISOString().substring(0, 10);
    console.log(date_string);
    var fs = require("fs");
    if ( fs.existsSync('/tmp/'+ date_string) ){
        var gameResultsString = fs.readFileSync('/tmp/'+ date_string, "utf8");
        if (gameResultsString === null || gameResultsString == "") {
            getGameLog(response,date_string);
        }
        else {
            response.tell(gameResultsString);
        }
    }
    else {
        console.log("not found");
        getGameLog(response,date_string);
    }
}

function getGameLog(response,date_string) {
    var http = require('http');
    var url = "http://live.nhle.com/GameData/GCScoreboard/" + date_string + ".jsonp";
    console.log(url);

    http.get(url, function(http_response) {
        var finalData = "";

        http_response.on("data", function (data) {
            finalData += data.toString();
        });
        
        http_response.on("end", function() {
            handleGameLogCallback(response,finalData);
        });

        http_response.on("error", function(err) {
            weFailed(response,err);
        });
    });
}

function handleGameLogCallback(response,data) {
    var startPos = data.indexOf('({');
    if (startPos < 0) {
        weFailed(response);
    }
    else {
        var endPos = data.indexOf('})');
        var jsonString = data.substring(startPos+1, endPos+1);
        var jsonData = JSON.parse(jsonString);


        var opponentNickname = null;
        var opponentScore = null;
        var flyersScore = null;
        var gameDateString = jsonData.currentDate;
        
        for (var i=0;i < jsonData.games.length;i++) {
            if (jsonData.games[i].htn == "PHILADELPHIA" || jsonData.games[i].atn == "PHILADELPHIA") {
                if (jsonData.games[i].bs == "FINAL") {
                    if (jsonData.games[i].htn == "PHILADELPHIA") {
                        opponentNickname = jsonData.games[i].htcommon;
                        opponentScore = jsonData.games[i].ats;
                        flyersScore = jsonData.games[i].hts;
                    }
                    else {
                        opponentNickname = jsonData.games[i].htcommon;
                        opponentScore = jsonData.games[i].hts;
                        flyersScore = jsonData.games[i].ats;
                    }
                    break;
                }
                
            }
        }
        
        if (flyersScore === null) {
            var previousGameDateString = new Date(jsonData.prevDate).toISOString().substring(0, 10);
            console.log(previousGameDateString);
            getGameLog(response,previousGameDateString);
        }
        else {

            var whenWasTheGame = null;
            var gameDate = Date.parse(gameDateString);
            var rawDate = new Date();
            var today = new Date(rawDate.getFullYear(),rawDate.getMonth(),rawDate.getDate());
            var dateDifference = today-gameDate;
            var oneDayEpoch = 24*60*60*1000;
            var daysAgo = (dateDifference/oneDayEpoch).toFixed();

            var whenWasTheGame = null;
            if (gameDate < today) {
                if (daysAgo == 1) {
                    whenWasTheGame = "Yesterday";
                }
                else {
                    whenWasTheGame = "The other day";
                }
                
            }
            else {
                whenWasTheGame = "Today";
            }

            var gameResultsString = null;

            if (flyersScore > opponentScore) {
                winning = true;
                gameResultsString = randomMessageByType("WIN") + " " + whenWasTheGame + " The Flyers beat The " + opponentNickname + " " + flyersScore + " to " + opponentScore + ".";
            }
            else {
                winning = false;
                gameResultsString = randomMessageByType("LOSE") + " " + whenWasTheGame + " The Flyers lost to The " + opponentNickname + " " + opponentScore + " to " + flyersScore + ".";
            }
            
            var current_file_date = new Date().toISOString().substring(0, 10);
            var fs = require("fs");
            fs.writeFileSync( '/tmp/' + current_file_date,gameResultsString, "utf8")
            console.log(gameResultsString);
            response.tell(gameResultsString);
        }
    }
}

function randomMessageByType(messageType) {
    if (messageType == "WIN") {
        var winMessageIndex = Math.floor(Math.random() * WIN_MESSAGES.length);
        var randomWinMessage = WIN_MESSAGES[winMessageIndex];
        return randomWinMessage;
    }
    
    if (messageType = "LOSE") {
        var loseMessageIndex = Math.floor(Math.random() * LOSE_MESSAGES.length);
        var randomLoseMessage = LOSE_MESSAGES[loseMessageIndex];
        return randomLoseMessage;
    }

    if (messageType = "ERROR") {
        var errorIndex = Math.floor(Math.random() * ERROR_MESSAGES.length);
        var randomError = ERROR_MESSAGES[errorIndex];
    }
 }

function weFailed(response,err) {    
    var errorString =  randomMessageByType("ERROR") + " I can't get the scores right now. Try back in a bit.";
    console.log(errorString);
    response.tell(errorString);
}


// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    var skill = new Skill();
    skill.execute(event, context);
};

