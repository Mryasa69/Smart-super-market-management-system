const nodemailer = require('nodemailer');

/**
 * Send email utility
 * @param {Object} options Options containing email parameters
 * @param {string} options.email Destination email address
 * @param {string} options.subject Email subject
 * @param {string} options.message Plain text message (fallback)
 * @param {string} options.html HTML content
 */
const sendEmail = async (options) => {
  let transporter;

  // Check if SMTP is configured
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Fallback: Ethereal test account (logs link to terminal)
    console.log('SMTP config not complete. Generating temporary Ethereal test SMTP account...');
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  const mailOptions = {
    from: process.env.SMTP_FROM || '"Smart Supermarket" <no-reply@smartsupermarket.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  const info = await transporter.sendMail(mailOptions);

  console.log(`Message sent: ${info.messageId}`);
  if (!process.env.SMTP_HOST) {
    // Log Ethereal URL where user can see the actual email sent
    console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
  }
};

module.exports = sendEmail;
