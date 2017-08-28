var Alexa = require('alexa-sdk');

var SOUNDS = [
    {
        "audio": "https://s3.amazonaws.com/staging.futurimedia.com/sound-assets/peacockCall.mp3",
        "name": "peacock"
    },
    {
        "audio": "https://s3.amazonaws.com/staging.futurimedia.com/sound-assets/recordScratch.mp3",
        "name": "record scratch"
    }
];


exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);

    // alexa.dynamoDBTableName = 'YourTableName'; // creates new table for userid:session.attributes

    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    'LaunchRequest': function () {
        this.emit('PlayIntent');
    },

    'PlayIntent': function () {
        var soundId = randomSound(),
            sound = SOUNDS[soundId],
            audioClip = '<audio src="'+sound.audio+'" />';

        this.attributes['soundId'] = soundId;
        this.emit(':ask', 'Here is your mystery sound: ' + audioClip + ' <break time="1s"/> What is your guess?', 'What is your guess?');
    },

    'GuessIntent' : function() {
        var soundId = null,
            sound = null;
        if ('soundId' in this.attributes && typeof this.attributes['soundId'] !== 'undefined') {
            soundId = this.attributes['soundId'];
            sound = SOUNDS[soundId];
        }

        if (sound !== null) {
            var myGuess = this.event.request.intent.slots.guess.value;
            var txtEchoGuess = 'Your guess is: ' + myGuess + '.';

            if (myGuess.indexOf(sound.name) !== -1) {
                this.emit(':ask', txtEchoGuess + ' <say-as interpret-as="interjection">Bang!</say-as> You got it! Would you like me to play another sound?', 'Would you like me to play another sound?');
            } else {
                this.emit(':ask', txtEchoGuess + ' <say-as interpret-as="interjection">D\'oh!</say-as> That\'s wrong. Guess again.', 'Guess again.');
            }
        }
        else {
            this.emit(':ask', 'I have not played you a sound yet. Tell me to play the sound.', 'Tell me to play the sound.');
        }
    },

    'AMAZON.YesIntent' : function() {
        this.emit('PlayIntent');
    },

    'AMAZON.NoIntent' : function() {
        this.emit(':tell', '<say-as interpret-as="interjection">Arrivederci.</say-as>');
    },

    'AMAZON.HelpIntent' : function() {
        this.emit(':ask', 'Welcome to Mystery Sound. You can tell me, play the sound, or, stop. How can I help you?');
    },
    'AMAZON.StopIntent' : function() {
        this.emit(':tell', '<say-as interpret-as="interjection">Arrivederci.</say-as>');
    },
    'AMAZON.CancelIntent' : function() {
        this.emit(':tell', '<say-as interpret-as="interjection">Arrivederci.</say-as>');
    }
};


// HELPERS

function randomSound() {
    return Math.floor(Math.random() * SOUNDS.length);
}
