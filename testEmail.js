require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
});

transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: 'NestFinder Test Email',
    text: 'Email is working!'
}, (err, info) => {
    if (err) console.log('❌ Error:', err);
    else console.log('✅ Email sent!', info.response);
});