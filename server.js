const express = require('express');
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const urlencoded = require('body-parser').urlencoded;
const WebSocket = require("ws");
const fs = require("fs");
const app = express();

//Include Google Speech to Text
const speech = require("@google-cloud/speech");
const client = new speech.SpeechClient();

//Configure Transcription Request
const request = {
    config: {
        encoding: "MULAW",
        sampleRateHertz: 8000,
        languageCode: "en-GB"
    },
    interimResults: true
};

// Parse incoming POST params with Express middleware
app.use(urlencoded({ extended: false }));
app.use(express.static('public'));


app.get('/twiml', (req, response) => {
    const twiml = new VoiceResponse();

    twiml.say('For sales, press 1. For support, press 2.')
    twiml.start().stream({
        name: "Example Live Stream",
        url: "wss://covid-strikers.herokuapp.com/twiml"
    });
    twiml.pause({
        length: 10
    });

    // Render the response as XML in reply to the webhook request
    response.type('text/xml');
    response.send(twiml.toString());
});
app.post('/collect', (request, response) => {
    console.log(request.body);
    response.end();
});

app.get('/autopilot', (request, response) => {
    const twiml = new VoiceResponse();
    twiml.connect().autopilot('UA9d056273f3deda2c8062a2d0c715a8cc');
    response.type('text/xml');
    response.end(twiml.toString());
});
// Create a route that will handle Twilio webhook requests, sent as an
// HTTP POST to /voice in our application
app.post('/voice', (request, response) => {
    // Use the Twilio Node.js SDK to build an XML response
    const twiml = new VoiceResponse();

    const gather = twiml.gather({
        action: '/gather',
        input: 'speech',
        speechTimeout: 5
    });
    //gather.say('For sales, press 1. For support, press 2.');
    gather.say('Say yes or no');

    // If the user doesn't enter input, loop
    twiml.redirect('/voice');

    // Render the response as XML in reply to the webhook request
    response.type('text/xml');
    response.send(twiml.toString());
});

app.get('/reject', (request, response) => {
    console.log(request);
    // Use the Twilio Node.js SDK to build an XML response
    const twiml = new VoiceResponse();

    twiml.reject({
        reason: 'busy'
    });

    response.type('text/xml');
    response.send(twiml.toString());
});


// Create a route that will handle <Gather> input
app.post('/gather', (request, response) => {
    // Use the Twilio Node.js SDK to build an XML response
    const twiml = new VoiceResponse();

    // If the user entered digits, process their request
    twiml.say(`Your response is :  ${request.body.SpeechResult}`);
    if (request.body.Digits) {
        switch (request.body.Digits) {
            case '1':
                twiml.say('You selected sales. Good for you!');
                break;
            case '2':
                twiml.say('You need support. We will help!');
                break;
            default:
                twiml.say("Sorry, I don't understand that choice.").pause();
                twiml.redirect('/voice');
                break;
        }
    } else {
        // If no input was sent, redirect to the /voice route
        twiml.redirect('/voice');
    }

    // Render the response as XML in reply to the webhook request
    response.type('text/xml');
    response.send(twiml.toString());
});

// Create an HTTP server and listen for requests on port 3000
console.log('Twilio Client app HTTP server running at http://127.0.0.1:3000');
const server = app.listen(process.env.PORT || 3000);
const wss = new WebSocket.Server({ server });
let file;
wss.on('connection', (socket) => {
    let recognizeStream = null;

    console.log("Connection Received");
    socket.on("message", (m) => {
        const msg = JSON.parse(m);
        switch (msg.event) {
            case "connected":
                console.log(`A new call has connected.`);
                break;
            case "start":
                console.log(`Starting Media Stream ${msg.streamSid}`);
                /*file = fs.createWriteStream(msg.streamSid, {
                    encoding: "base64"
                });*/
                // Create Stream to the Google Speech to Text API
                recognizeStream = client
                    .streamingRecognize(request)
                    .on("error", console.error)
                    .on("data", data => {
                        console.log(data.results[0].alternatives[0].transcript);
                    });
                break;
            case "media":
                console.log(`Receiving Audio...`);
                //file.write(msg.media.payload);
                recognizeStream.write(msg.media.payload);
                break;
            case "stop":
                console.log(`Call Has Ended`);
                //file.end();
                recognizeStream.destroy();
                break;
        }
    });
});
