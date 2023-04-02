/**
 * Copyright 2021-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Messenger Platform Quick Start Tutorial
 *
 * This is the completed code for the Messenger Platform quick start tutorial
 *
 * https://developers.facebook.com/docs/messenger-platform/getting-started/quick-start/
 *
 * To run this code, you must do the following:
 *
 * 1. Deploy this code to a server running Node.js
 * 2. Run `yarn install`
 * 3. Add your VERIFY_TOKEN and PAGE_ACCESS_TOKEN to your environment vars
 */

// README, in shirley machine: cd /Users/shirleysu/Projects/messengerwebhook && git add . && git commit -m "update" && git push
// github url: https://github.com/jackpersonalsu/messengerwebhook

// one setup https://dashboard.heroku.com/apps
// https://dashboard.heroku.com/pipelines/d6caf541-13a7-40fb-8b75-9671e4aff0e1

'use strict';

// Use dotenv to read .env vars into Node
require('dotenv').config();
const openai = require('openai');

// Imports dependencies and set up http server
const
  request = require('request'),
  express = require('express'),
  { urlencoded, json } = require('body-parser'),
  app = express();

// Parse application/x-www-form-urlencoded
app.use(urlencoded({ extended: true }));

// Parse application/json
app.use(json());

// Respond with 'Hello World' when a GET request is made to the homepage
app.get('/', function (_req, res) {
  res.send('<HTML><BODY>Welcome, this is placehold for Bobo Chat Bot</BODY></HTML>');
});

// Adds support for GET requests to our webhook
app.get('/verifyrole', (req, res) => {
  // https://bobomessengerbot.herokuapp.com/verifyrole
    console.log('verifyrole is called');
    res.status(200).send('<html><body>verify role test page</body></html>');
});

app.get('/tos', (req, res) => {
  // https://bobomessengerbot.herokuapp.com/verifyrole
    console.log('tos is called');
    res.status(200).send('<html><body>This is placeholder for Terms And Services for BoboChatBot, a testing bot site</body></html>');
});

app.get('/privacy', (req, res) => {
  // https://bobomessengerbot.herokuapp.com/verifyrole
    console.log('privacy is called');
    res.status(200).send('<html><body>This is placeholder for Privacy Policy for BoboChatBot, a testing bot site</body></html>');
});

// Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {

  // Your verify token. Should be a random string.
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

  // Parse the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  // Checks if a token and mode is in the query string of the request
  if (mode && token) {

    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {

      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);

    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});

// Creates the endpoint for your webhook
app.post('/webhook', (req, res) => {
  let body = req.body;

  // Checks if this is an event from a page subscription
  if (body.object === 'page') {

    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {

      // Gets the body of the webhook event
      console.log('webevent', entry);
      let webhookEvent = entry.messaging[0];

      // Get the sender PSID
      let senderPsid = webhookEvent.sender.id;
      let recPsid = webhookEvent.recipient.id;
      console.log('Sender PSID: ' + senderPsid);
      console.log('recPsid:' + recPsid);
      
      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhookEvent.message && recPsid === '105907225783056') {
        handleMessage(senderPsid, webhookEvent.message);
      } else if (webhookEvent.postback && recPsid === '105907225783056') {
        handlePostback(senderPsid, webhookEvent.postback);
      }
    });

    // Returns a '200 OK' response to all requests
    return res.status(200).send('EVENT_RECEIVED');
  } else {

    // Returns a '404 Not Found' if event is not from a page subscription
    return res.sendStatus(404);
  }
});

// Handles messages events
function handleMessage(senderPsid, receivedMessage) {
  console.log('handle message', receivedMessage);

//   message {

//   mid: 'm__ZXg2RTfz_qByCrRMp__LtdMZVU2x8pI2h68-Nj-qgWKJpTD21lqLi0t5uMAsaINHD2f47_3iM6Emx3moICjkQ',
    
//  attachments: [ { type: 'audio', payload: [Object] } ]


  console.log(receivedMessage.text);
  let response;

  // Checks if the message contains text
  if (receivedMessage.text) {
    // Create the payload for a basic text message, which
    // will be added to the body of your request to the Send API
    response = {
      'text': `You sent the message: '${receivedMessage.text}'. Now send me an attachmentv2!`
    };
  } else if (receivedMessage.attachments) {

    // Get the URL of the message attachment
    let attachmentUrl = receivedMessage.attachments[0].payload.url;
    response = {
      'attachment': {
        'type': 'template',
        'payload': {
          'template_type': 'generic',
          'elements': [{
            'title': 'Is this the right picture?',
            'subtitle': 'Tap a button to answer.',
            'image_url': attachmentUrl,
            'buttons': [
              {
                'type': 'postback',
                'title': 'Yes!',
                'payload': 'yes',
              },
              {
                'type': 'postback',
                'title': 'No!',
                'payload': 'no',
              }
            ],
          }]
        }
      }
    };
  }

  // Send the response message
  callSendAPI(senderPsid, response, receivedMessage.text);
}

// Handles messaging_postbacks events
function handlePostback(senderPsid, receivedPostback) {
  let response;

  // Get the payload for the postback
  let payload = receivedPostback.payload;

  // Set the response based on the postback payload
  if (payload === 'yes') {
    response = { 'text': 'Thanks!' };
  } else if (payload === 'no') {
    response = { 'text': 'Oops, try sending another image.' };
  }
  // Send the message to acknowledge the postback
  callSendAPI(senderPsid, response, 'just say hi');
}

// Sends response messages via the Send API
function callSendAPI(senderPsid, response, requestText) {
  console.log('sen call api');
  // The page access token we have generated in your app settings
  const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

  let auth = `Bearer ${process.env.OPENAI_API_KEY}`;
  let prompt = `answer the following question: ${requestText}`;
  console.log("sender psid", senderPsid);
  let params = {
    "model": "text-davinci-003",
    "prompt": prompt,
    "temperature": 0, 
    "max_tokens": 128,
  };
  console.log('sending request');
  request({
    uri: 'https://api.openai.com/v1/completions',
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': auth,
    },
    json: params,
  }, (err0, res, body) => {
    console.log('openai response ', body);
    console.log('openai response ', body.choices[0].text);
    let openai_response = {
      'text': body.choices[0].text
    };

    let requestBody = {
      'recipient': {
        'id': senderPsid
      },
      'message': openai_response
    };
    // Send the HTTP request to the Messenger Platform
    request({
      'uri': 'https://graph.facebook.com/v2.6/me/messages',
      'qs': { 'access_token': PAGE_ACCESS_TOKEN },
      'method': 'POST',
      'json': requestBody
    }, (err, _res, _body) => {
      if (!err) {
        console.log('Message sent!');
      } else {
        console.error('Unable to send message:' + err);
      }
    });
  });  
}

// discord bot
const Discord = require('discord.js');
const discordClient = new Discord.Client();
const discordToken =   process.env.DISCORD_TOKEN;;

discordClient.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

discordClient.on('message', (message) => {
  if (message.content === '!hello') {
    message.reply('Hello from bobo chat bot!');
  }
});

discordClient.login(discordToken);



// listen for requests :)
var listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});




