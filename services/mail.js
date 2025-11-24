const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 2525,
  secure: false,
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
       html: message, 
  });

  console.log("Message sent:", info.messageId);
 
}

module.exports = SendMail