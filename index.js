const VoiceResponse = require('twilio/lib/twiml/VoiceResponse');
require("dotenv").config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_KEY;
const client = require('twilio')(accountSid, authToken);

const procureNumber = async (customClient) => {
  const availablePhoneNumbers = await customClient.availablePhoneNumbers
    .list({ limit: 20 })
  availablePhoneNumbers.forEach(a => console.log(a.countryCode));
  let phNo;
  const local = await customClient.availablePhoneNumbers('US')
    .local
    .list({ areaCode: 205, limit: 1 })
  local.forEach(l => () => { phNo = l.phoneNumber });

  const inc = await customClient.incomingPhoneNumbers
    .create({ phoneNumber: phNo, areaCode: 205 })
  console.log(inc.sid);
}

const createSubAccount = async () => {
  const account = await client.api.accounts.create({ friendlyName: 'Submarine' })
  console.log(account.sid);
  console.log(account.authToken);
}

(async () => {
  try {
    /*const account = await client.api.accounts.create({friendlyName: 'Submarine'})
    console.log(account.sid);
    console.log(account.authToken);*/
    //await procureNumber(require('twilio')(account.sid, account.authToken));
    await procureNumber(require('twilio')("AC0fdf635c94b6c73e827c66d812b40ad5", "18d071ad8aeab6eef5823915a033f658"));
    /*const response = new VoiceResponse();
    response.redirect({
      method: 'GET'
    }, 'https://covid-strikers.herokuapp.com/autopilot');

    console.log(response.toString());
    const call = await client.calls
      .create({
        //url: 'https://covid-strikers.herokuapp.com/autopilot',
        url: 'https://covid-strikers.herokuapp.com/voice',
        //twiml: response.toString(),
        to: '+919619503031',
        //to: '+919158484949',
        //from: '+12058285302'
        from: '+12057368176'
      });
    console.log(call.sid);*/
  }
  catch (error) {
    console.log(error);
  }
})();
