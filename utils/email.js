const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1) CREATE A TRANSPORTER
  const transporter = nodemailer.createTransport({
    // service: 'Gmail',
    host: process.env.EMAIL_HOST,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  // 2) DEFINE  THE EMAIL
  const mailOptions = {
    from: 'senglaypann@mail.com',
    to: options.email,
    subject: options.email,
    text: options.message,
    // html:
  };

  // 3) ACUALLY SEND THE EMAIL
  await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;