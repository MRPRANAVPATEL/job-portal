const nodemailer = require('nodemailer');
function mailConfigured() {
  return Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);
}
async function sendMail(to, subject, text) {
  const port = Number(process.env.SMTP_PORT || 587);
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com', port, secure: port === 465,
    auth: {user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS}
  });
  await transport.sendMail({from: process.env.EMAIL_USER, to, subject, text});
}
module.exports = {mailConfigured, sendMail};
