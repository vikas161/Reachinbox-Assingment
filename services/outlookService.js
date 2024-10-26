const outlook  =  require('node-outlook');
const axios = require('axios');
const { addEmailJob } = require('../queue/emailQueue');
const {categorizeEmail, generateReply} = require('./geminiService')

class Outlook {
static token = ""
static getOutlookAccessToken = async (code) => {
    const tokenUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
  
    const params = new URLSearchParams();
    params.append('client_id', process.env.OUTLOOK_CLIENT_ID);
    params.append('scope', 'https://graph.microsoft.com/Mail.Send,https://graph.microsoft.com/Mail.Read');
    params.append('code', code);
    params.append('redirect_uri', process.env.OUTLOOK_REDIRECT_URL);
    params.append('grant_type', 'authorization_code');
    params.append('client_secret', process.env.OUTLOOK_CLIENT_SECRET);
  
    try {
      const response = await axios.post(tokenUrl, params);
      token = response.data.access_token
      console.log('Access Token:', response.data.access_token);
      return response.data.access_token;
    } catch (error) {
      console.error('Error fetching access token:', error.response.data);
    }
};

static readOutlookEmails = async () => {
    try{
    const queryOptions = {
      token: this.token,
      folderId: 'inbox',
      odataParams: {
        $filter: 'isRead eq false',
        $top: 10,
      },
    };
  
    const data = await outlook.mail.getMessages(queryOptions);

    const messages =  data.value.map((msg) => ({
        from: msg.from.emailAddress.address,
        subject: msg.subject,
        body: msg.body.content,
      }));

      for(const message of messages)
      {
          await addEmailJob({provider: "outlook", message: message})
      }

      console.log('Fetched Emails:', messages);
    }
    catch(error)
    {
        console.error('Error fetching emails:', error);
    }
};

static processOutlookEmail = async(message) => {
    try{
        const category = await categorizeEmail(message.subject, message.body);
        const reply = await generateReply(category);

        // send email
        await this.sendEmail( message.from, `Re: ${message.subject}`, reply);
    }catch(error)
    {
        console.error('Error processing outlook emails:', err);
    }
};

static sendEmail = async (to, subject, content)=> {
    const message = {
        Subject: subject,
        Body: {
          ContentType: 'Text',
          Content: content,
        },
        ToRecipients: [
          {
            EmailAddress: {
              Address: to,
            },
          },
        ],
      };
      
      const options = {
        token: this.token,  // Replace with a valid access token
        message: message,
      };
      
      outlook.mail.sendNewMessage(options, (error, result) => {
        if (error) {
          console.error('Outlook Error sending email:', error);
        } else {
          console.log('Outlook Email sent successfully!', result);
        }
      });
};
}

module.exports = Outlook