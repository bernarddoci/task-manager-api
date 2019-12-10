const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'bernard.doci@gmail.com',
        subject: 'Thanks for joining in!',
        text: `Welcom to the app, ${name}. Let me know how you get along with the app.`
    })
}

const sendGoodByeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'bernard.doci@gmail.com', 
        subject: 'Goodbye',
        text: `Goodbay ${name}, is there something we can do to keep you here?`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendGoodByeEmail
}