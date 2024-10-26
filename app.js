const express = require("express")
const { google } = require('googleapis');
require('dotenv')
const { generateAuthUrl, getOutlookAuthUrl, getGoogleAccessToken, getOutlookAccessToken, googleOAuth2Client } = require('./services/oauthService')
const {processMail, fetchUnreadEmails} = require('./services/gmailService')
const Outlook = require('./services/outlookService')
require('./queue/worker'); // Start the worker
require('dotenv').config();
const app = express()
const PORT = 3000


app.get('/auth/google', (req, res) => {
  res.redirect(generateAuthUrl());
});

app.get('/auth/google/callback', async (req, res) => {
  const tokens = await getGoogleAccessToken(req.query.code);
  res.send('Google account connected!');
});

app.get('/auth/outlook', (req, res) => {
  res.redirect(getOutlookAuthUrl());
});

app.get('/auth/outlook/callback', async (req, res) => {
  const tokens = await Outlook.getOutlookAccessToken(req.query.code);
  res.send('Outlook account connected!');
});

app.get('/google/emails', async (req, res) => {
  try{
  await fetchUnreadEmails()
  res.send("Emails fetched !!!")
  }
  catch(e)
  {
    res.send("Something went wrong !!!")
  }
});

app.get('/outlook/emails', async (req, res) => {
  try{
  await Outlook.readOutlookEmails();
  res.send("Emails fetched !!!")
  }
  catch(e)
  {
    res.send("Something went wrong !!!")
  }
});

app.get('/google/process', async (req, res) => {
  try{
  await processMail(req.query.id)
  res.send("Emails replied !!!")
  }
  catch(e)
  {
    res.send("Something went wrong !!!")
  }
});
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

