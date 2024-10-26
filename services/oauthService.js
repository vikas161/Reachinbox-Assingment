const { google } = require('googleapis');
const { outlook } = require('node-outlook');

// Google OAuth2 setup
const googleOAuth2Client = new google.auth.OAuth2(
     process.env.GOOGLE_CLIENT_ID,
     process.env.GOOGLE_CLIENT_SECRET,
     process.env.REDIRECT_URL
  );


// Generate Google OAuth URL
const generateAuthUrl = () => {
    const scopes = [
        'https://www.googleapis.com/auth/gmail.send', // Write access to send emails
        'https://www.googleapis.com/auth/gmail.readonly',
      ];
      return googleOAuth2Client.generateAuthUrl({ access_type: 'offline', scope: scopes });
    
  };

const getGoogleAccessToken = async (code) => {
    const { tokens } = await googleOAuth2Client.getToken(code);
    googleOAuth2Client.setCredentials(tokens);
    return tokens;
};

// Generate Outlook OAuth URL (this is just a placeholder example)
const getOutlookAuthUrl = () => {
    const scopes = ['offline_access', 'Mail.Read', 'Mail.Send']; // Outlook send scope
  return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${process.env.OUTLOOK_CLIENT_ID}&response_type=code&redirect_uri=${process.env.OUTLOOK_REDIRECT_URL}&response_mode=query&scope=${scopes.join('%20')}`;
  };

module.exports = { generateAuthUrl, getOutlookAuthUrl, getGoogleAccessToken, googleOAuth2Client };
