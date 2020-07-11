const VoiceResponse = require('twilio/lib/twiml/VoiceResponse');

const accountSid = 'ACda434a1eb687535000d81a7b4914067b';
const authToken = 'b1e78f19c965239d84580f8491abc302';
const client = require('twilio')(accountSid, authToken);

(async () => {
  const response = new VoiceResponse();
  response.redirect({
    method: 'GET'
  }, 'https://covid-strikers.herokuapp.com/autopilot');

  console.log( response.toString());
  const call = await client.calls
    .create({
      //url: 'https://covid-strikers.herokuapp.com/autopilot',
      url: 'https://covid-strikers.herokuapp.com/voice',
      //twiml: response.toString(),
      to: '+917588415318',
      //to: '+919158484949',
      from: '+12058285302'
    });
  console.log(call.sid);
})();
