require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // 465 requires secure: true
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

async function sendEmail(to, sub, msg) {
    try {
        const info = await transporter.sendMail({
            from: `"Triova Limited" <${process.env.EMAIL_USER}>`,
            to,
            subject: sub,
            html: msg,
        });
    } catch (error) {
        console.error("Error sending email:", error);
    }
}

module.exports.sendEmail = sendEmail;
