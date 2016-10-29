
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


getGameLog();

function getGameLog() {
	var http = require('http');
	var url = "http://live.nhle.com/GameData/RegularSeasonScoreboardv3.jsonp";
	
	http.get(url, function(response) {
		var finalData = "";

	 	response.on("data", function (data) {
	 		finalData += data.toString();
	  	});
		
		response.on("end", function() {
	    	handleGameLogCallback(finalData);
	  	});

	 	response.on("error", function(err) {
  			weFailed(err);
		});
	});
}

function handleGameLogCallback(data) {
	var startPos = data.indexOf('({');
    var endPos = data.indexOf('})');
    var jsonString = data.substring(startPos+1, endPos+1);
    var jsonData = JSON.parse(jsonString);

    var opponentNickname = null;
    var opponentScore = null;
    var flyersScore = null;
    var gameDateString = null;
    
    for (var i=0;i < jsonData.games.length;i++) {
    	if (jsonData.games[i].htn == "Philadelphia" || jsonData.games[i].atn == "Philadelphia") {
    		if (jsonData.games[i].tsc == "final") {
    			//console.log(jsonData.games[i]);
    			gameDateString = jsonData.games[i].ts;
    			if (jsonData.games[i].htn == "Philadelphia") {
    				opponentNickname = jsonData.games[i].atv;
    				opponentScore = jsonData.games[i].ats;
    				flyersScore = jsonData.games[i].hts;
    			}
    			else {
					opponentNickname = jsonData.games[i].htv;
    				opponentScore = jsonData.games[i].hts;
    				flyersScore = jsonData.games[i].ats;
    			}
    			break;
    		}
    		
    	}
    }

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
		gameResultsString = randomMessageByType("WIN") + " " + whenWasTheGame + " The Flyers beat The" + opponentNickname + " " + flyersScore + " to " + opponentScore + ".";
	}
	else {
		winning = false;
		gameResultsString = randomMessageByType("LOSE") + " " + whenWasTheGame + " The Flyers lost to The " + opponentNickname + " " + opponentScore + " to " + flyersScore + ".";
	}
	
	console.log(gameResultsString);
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

function weFailed(err) {
	var gameResultsString =  randomMessageByType("ERROR") + " I can't get the scores right now. Try back in a back.";
	console.log(gameResultsString);
}