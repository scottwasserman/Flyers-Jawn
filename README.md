# Flyers-Jawn

This is the Skill configuration and Lambda for my Alexa Skill Flyers Fan.  I originally submitted this Skill with the name Flyers Jawn but Amazon rejected my Sixers Jawn Skill because of using the word Jawn so I withdrew this Skill and udpated it. I changed the name to Flyers Fan. I've resubmitted it and hopefully it will fly.

I wanted to build a skill to quickly find out the current or last Flyers score and I wanted it to seem like it was coming from a buddy in Philly. This borrows heavily from my Sixers Jawn code:
https://github.com/scottwasserman/Sixers-Jawn

Most of the skill configuration is the same and was much easier to build because, unlike Sixers Jawn (check the link above for the details of my challenges), I quickly found a url to get the data:
http://live.nhle.com/GameData/RegularSeasonScoreboardv3.jsonp

I reused all the win, lose and error phrases from Sixers Jawn to get the bot talking more casually. Here's the phrases:
``` JavaScript
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
```
I'll definitely be adding more as time goes on.  Feel free to make a recommendation.

This is in no way a complex Alexa skill but hopefully can be a useful example of how to easily incorporate data from a remote API in a node.js-based Lambda.

The Lambda code is in the source directory and the Alexa Skill configuration is in the SpeechAssets directory.  I got this structure from Amazon's tutorial code: https://github.com/amzn/alexa-skills-kit-js



