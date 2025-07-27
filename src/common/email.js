const nodemailer = require('nodemailer');
const mailConfig = require("@common/configMail");
/*const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: '@gmail.com', // 🔁 Replace with your Gmail address
    pass: ''     // 🔐 App password with NO spaces
  }
});*/
const transporter = nodemailer.createTransport({
  host: mailConfig.smtpHost,
  port: mailConfig.smtpPort,
  secure: mailConfig.secure || false,
  auth: {
    user: mailConfig.username,
    pass: mailConfig.password
  }
});
/**
 * Sends a verification email with the provided code.
 * 
 * @param {string} to - Recipient's email address
 * @param {string} code - Verification code to send
 */
async function sendVerificationEmail(to, code) {
  try {
    const info = await transporter.sendMail({
      from: '"Ghost App" tjianicho@gmail.com>', // 🔁 Replace with your name/email
      to,
      subject: 'Your Verification Code',
      html: `<p>Your verification code is: <b>${code}</b></p>`
    });

    console.log('✅ Email sent:', info.messageId);
  } catch (err) {
    console.error('❌ Failed to send email:', err);
    throw new Error('Email send failed');
  }
}

module.exports = { sendVerificationEmail };