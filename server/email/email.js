const path = require('path');
const nodemailer = require('nodemailer');
const auth = require(path.join(__dirname, 'auth.js'));

exports.notify = (subject, message) => {
    const transporter = nodemailer.createTransport({
        service: auth.service,
        auth: auth.auth
    });
    
    const mailOptions = {
        from: auth.source,
        to: auth.dest,
        subject: subject,
        text: message
    };
    
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        }
    });
}