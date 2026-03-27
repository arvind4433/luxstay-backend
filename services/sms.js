// Download the helper library from https://www.twilio.com/docs/node/install
const twilio = require("twilio"); // Or, for ESM: import twilio from "twilio";

// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const sendSMS = async (mobile, message) => {
  // Accept numbers with or without country code; you can adjust logic for other countries
  const toNumber = mobile.startsWith('+') ? mobile : `+91${mobile}`;

  try {
    const response = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: toNumber,
    });
    console.log("SMS sent successfully:", response.sid);
    return response;
  } catch (error) {
    console.error("Error sending SMS:", error);
    // re‑throw so callers can handle failures if needed
    throw error;
  }
};

module.exports = {sendSMS};

