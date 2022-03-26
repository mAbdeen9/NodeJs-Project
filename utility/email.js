const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // -1 Create a transporter
  const transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "d9869ceaff9ea3",
      pass: "90310ea5017cca",
    },
  });
  // -2 Define the email options
  const mailOption = {
    from: "Mohammad Abdeen First Node.js App",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  // -3 Actually Send the email
  await transport.sendMail(mailOption);
};

module.exports = sendEmail;
