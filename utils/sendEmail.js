const nodemailer = require('nodemailer')


const transporter = nodemailer.createTransport({
    service: process.env.HostName,
    auth: {
        user: process.env.Email,
        pass: process.env.Password,
    },
});



exports.sendOTPEmail = (email, otp) => {
    const mailOptions = {
        from: process.env.Email,
        to: email,
        subject: 'Email Verification OTP',
        text: `Your OTP is: ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Email sending error: ', error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}


exports.resetPasswordMail = (email, token) => {
    const mailOptions = {
        from: 'loveuashu9211@gmail.com',
        to: email,
        subject: 'Reset Password Mail',
        html: `<p>Please click here to Reset Password <a href="http://${process.env.HOSTNAME}:${process.env.PORT}/api/v1/user/resetPassword/${token}"</a>http://localhost:${process.env.PORT}/api/v1/user/resetPassword/${token}</p>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Email sending error: ', error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
} 
