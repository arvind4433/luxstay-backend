const nodemailer = require("nodemailer");

// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: "9aefde001@smtp-brevo.com",
    pass: process.env.BREVO_API_KEY,
  },
});

const SendMail = async (tomail, subject, message) => {

     const info = await transporter.sendMail({
    from: '"Pulse" <arvind8802225@gmail.com>',
    to: tomail,
    subject: subject,
       html: message, // HTML body
  });

  console.log("Message sent:", info.messageId);
 
}

module.exports = SendMail