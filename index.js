const VoiceResponse = require('twilio/lib/twiml/VoiceResponse');

const accountSid = 'ACda434a1eb687535000d81a7b4914067b';
const authToken = 'b1e78f19c965239d84580f8491abc302';
const client = require('twilio')(accountSid, authToken);

(async () => {
  const response = new VoiceResponse();
  response.redirect({
    method: 'GET'
  }, 'http://33978658b63d.ngrok.io/autopilot');

  console.log( response.toString());
  const call = await client.calls
    .create({
      //url: 'http://33978658b63d.ngrok.io/autopilot',
      url: 'http://33978658b63d.ngrok.io/voice',
      //twiml: response.toString(),
      to: '+917588415318',
      //to: '+919158484949',
      from: '+12058285302'
    });
  console.log(call.sid);
})();
