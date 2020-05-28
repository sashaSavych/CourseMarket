const keys = require('../keys');

module.exports = function (emailTo, token) {
    return {
        to: emailTo,
        from: keys.APP_EMAIL,
        subject: 'Reset password',
        html: `
            <h1>Hello from Course Market!</h1>
            <hr>
            <p>Click the link to set a new password</p>
            <a href="${keys.BASE_URL}/auth/new-password/${token}">Go to the market!</a>
      `
    };
};