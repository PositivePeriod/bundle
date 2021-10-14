const nodemailer = require("nodemailer");

async function sendMail(email) {
    try {
        const mailConfig = {
            service: "Google",
            host: "smtp.gmail.com",
            port: 465,
            auth: { user: process.env.MAIL_EMAIL, pass: process.env.MAIL_PASSWORD },
        };
        const message = {
            from: process.env.MAIL_EMAIL,
            to: email,
            subject: "이메일 인증 요청 메일입니다.",
            html: "<p> 여기에 인증번호나 token 검증 URL 붙이시면 됩니다! </p>",
        };
        const transporter = nodemailer.createTransport(mailConfig);
        transporter.sendMail(message);
    } catch (error) {
        console.log(error);
    }
}

sendMail("jeukhwang@gmail.com");
