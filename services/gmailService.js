const { google } = require('googleapis');
const { googleOAuth2Client } = require('./oauthService')
const {categorizeEmail, generateReply} = require('./geminiService')
const { addEmailJob } = require('../queue/emailQueue');

const gmail = google.gmail({ version: 'v1', auth: googleOAuth2Client });


const fetchUnreadEmails = async () => {
  try {
    const res = await gmail.users.messages.list({
      userId: 'me',
      q: 'is:unread', // Query to get unread emails
    });

    const messages = res.data.messages || [];
    console.log(`Found ${messages.length} unread messages.`);

    for (const message of messages) {
      // await addEmailJob({provider: "gmail", messageId: message.id})
    //   const messageContent = await openMessage(message.id);
    //   console.log(`Message ID: ${message.id}`);
    //   console.log(`Subject: ${messageContent.subject}`);
    //   console.log(`Body: ${messageContent.body}`);
    }
  } catch (error) {
    console.error('Error fetching emails:', error);
  }
};

const processMail = async (messageId) => {
    try{
        const messageContent = await openMessage(messageId);
        const category = await categorizeEmail(messageContent.subject, messageContent.body);
        const reply = await generateReply(category);

        // send email
        await sendGmail( messageContent.from, `Re: ${messageContent.subject}`, reply);
    }
    catch(err)
    {
        console.error('Error fetching emails:', err);
    }
};

const openMessage = async (messageId) => {
  try {
    const res = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'full', // Get the full message content
    });

    const message = res.data;

    // Extract the subject from headers
    const headers = message.payload.headers;
    const subjectHeader = headers.find((header) => header.name === 'Subject');
    const subject = subjectHeader ? subjectHeader.value : 'No Subject';
    const from = headers.find((header) => header.name === 'From')?.value || 'Unknown Sender';

    // Extract the body content (only from the first part for simplicity)
    const body = getBodyFromPayload(message.payload);

    return { from, subject, body };
  } catch (error) {
    console.error('Error opening message:', error);
  }
};

const getBodyFromPayload = (payload) => {
  let encodedBody;

  if (payload.parts) {
    // If the message has multiple parts (like HTML + plain text), take the first one
    const part = payload.parts.find((p) => p.mimeType === 'text/plain') || payload.parts[0];
    encodedBody = part.body.data;
  } else {
    // Single-part message
    encodedBody = payload.body.data;
  }

  // Decode the base64url-encoded body
  const decodedBody = Buffer.from(encodedBody, 'base64').toString('utf-8');
  return decodedBody;
};

const sendGmail = async (recipient, subject, body) => {
    const encodedMessage = Buffer.from(
      `From: me\nTo: ${recipient}\nSubject: ${subject}\n\n${body}`
    ).toString('base64');
  
    await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: encodedMessage },
    });
  
    console.log(`Email sent to ${recipient} via Gmail.`);
  };

module.exports = {processMail, fetchUnreadEmails}
