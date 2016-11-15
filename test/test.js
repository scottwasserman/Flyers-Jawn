
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
    "Alright! Alright! Alright!",
    "Philly in the house!",
    "Philly won up in here!",
    "In your face!",
    "Go Philly!",
    "Yeah boy!",
    "We got this!"
];

var TIE_MESSAGES = [
    "Meh!",
    "Could be worse!",
    "At least we didn't lose!",
    "Oh well!",
    "We could have done better!",
];

var LOSE_MESSAGES = [
    "We'll get them next time!",
    "Dang!",
    "Come on Philly!",
    "Yeah that Sucks!",
    "What the heck!",
    "Disapointing!",
    "Doh!"
];


//var date_string = new Date().toISOString().substring(0, 10);
//getGameLog(null,date_string);

checkForCache();

function checkForCache(response) {
    var date_string = new Date().toISOString().substring(0, 10);
    var fs = require("fs");
    if ( fs.existsSync('/tmp/'+ date_string) ){
        var storedGameResultsString = fs.readFileSync('/tmp/'+ date_string, "utf8");
        if (storedGameResultsString === null || storedGameResultsString == "") {
            getGameLog(response,date_string);
        }
        else {
            var storedGameResultsStringSplit = storedGameResultsString.split("::");
            if (storedGameResultsStringSplit[1] == null) {
                getGameLog(response,date_string);
            }
            else {
                gameResultsString = randomMessageByType(storedGameResultsStringSplit[0]) + " " + storedGameResultsStringSplit[1];
                //console.log(gameResultsString);
                response.tell(gameResultsString);
            }
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
                //console.log(jsonData.games[i].htcommon + " " + jsonData.games[i].atcommon);
                if (jsonData.games[i].bs == "FINAL") {
                    if (jsonData.games[i].htn == "PHILADELPHIA") {
                        opponentNickname = jsonData.games[i].atcommon;
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
            // console.log(previousGameDateString);
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
            var gameResultsToStoreString = null;

            if (flyersScore > opponentScore) {
                winning = true;
                gameResultsToStoreString =  "WIN::" + whenWasTheGame + " The Flyers beat The " + opponentNickname + " " + flyersScore + " to " + opponentScore + ".";
                gameResultsString = randomMessageByType("WIN") + " " + whenWasTheGame + " The Flyers beat The " + opponentNickname + " " + flyersScore + " to " + opponentScore + ".";
            }
            else {
                if (flyersScore == opponentScore) {
                    winning = false;
                    gameResultsToStoreString = "TIE::" + whenWasTheGame + " The Flyers tied The " + opponentNickname + " " + opponentScore + " to " + flyersScore + ".";
                    gameResultsString = randomMessageByType("TIE") + " " + whenWasTheGame + " The Flyers tied The " + opponentNickname + " " + opponentScore + " to " + flyersScore + ".";
                }
                else {
                    winning = false;
                    gameResultsToStoreString = "LOSE::" + whenWasTheGame + " The Flyers lost to The " + opponentNickname + " " + opponentScore + " to " + flyersScore + ".";
                    gameResultsString = randomMessageByType("LOSE") + " " + whenWasTheGame + " The Flyers lost to The " + opponentNickname + " " + opponentScore + " to " + flyersScore + ".";
                }
                
            }
            
            var current_file_date = new Date().toISOString().substring(0, 10);
            var fs = require("fs");
            fs.writeFileSync( '/tmp/' + current_file_date,gameResultsToStoreString, "utf8")
            console.log(gameResultsString);
            //response.tell(gameResultsString);
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

    if (messageType = "TIE") {
        var tieMessageIndex = Math.floor(Math.random() * TIE_MESSAGES.length);
        var randomTieMessage = TIE_MESSAGES[tieMessageIndex];
        return randomTieMessage;
    }

    if (messageType = "ERROR") {
        var errorIndex = Math.floor(Math.random() * ERROR_MESSAGES.length);
        var randomError = ERROR_MESSAGES[errorIndex];
    }
 }

function weFailed(err) {
	var gameResultsString =  randomMessageByType("ERROR") + " I can't get the scores right now. Try back in a back.";
	console.log(gameResultsString);
}