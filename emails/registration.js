const keys = require('../keys');

module.exports = function (emailTo) {
  return {
      to: emailTo,
      from: keys.APP_EMAIL,
      subject: 'Registration',
      html: `
            <h1>Welcome to the market!</h1>
            <p>User with email '${emailTo}' has been successfully created.</p>
            <hr>
            <a href="${keys.BASE_URL}">Go to the market!</a>
      `
  };
};