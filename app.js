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

'use strict';

// Use dotenv to read .env vars into Node
require('dotenv').config();

const openai = require('openai');
const openai_api_key = process.env.OPENAI_API_KEY;

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
  res.send('Hello World from jacksu v2');
});

// Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {

  // Your verify token. Should be a random string.
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

  // Parse the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  // let token = VERIFY_TOKEN;
  let challenge = req.query['hub.challenge'];
  console.log(mode);
  // console.log(token);
  console.log(challenge);

  // Checks if a token and mode is in the query string of the request
  if (mode && token) {

    // Checks the mode and token sent is correct
    if (mode === 'subscribe') {//} && token === VERIFY_TOKEN) {

      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);

    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  } else {
    // Responds with '403 Forbidden' if verify tokens do not match
    res.sendStatus(404);
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
      let webhookEvent = entry.messaging[0];

      // Get the sender PSID
      let senderPsid = webhookEvent.sender.id;
      console.log('V8 Sender PSID: ' + senderPsid);
      console.log('recipient ' + webhookEvent.recipient.id);

      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhookEvent.message) {
        handleMessage(senderPsid, webhookEvent.message);
      } else if (webhookEvent.postback) {
        handlePostback(senderPsid, webhookEvent.postback);
      }
    });

    // Returns a '200 OK' response to all requests
    res.status(200).send('EVENT_RECEIVED');
  } else {

    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(200);
  }
});

// Handles messages events
function handleMessage(senderPsid, receivedMessage) {
  let response;
  console.log("in handeMessage v8:");

  // Checks if the message contains text
  if (receivedMessage.text) {
    callOpenApi(senderPsid, receivedMessage.text);
    // callSendAPI(senderPsid,  {
    //   'text': 'whatsogonig'
    // });
  } else if (receivedMessage.attachments) {
    // Get the URL of the message attachment
    let attachmentUrl = receivedMessage.attachments[0].payload.url;
    callSendAPI(attachmentUrl, response);
  }
}

function callOpenApi(senderPsid, requestText) {
  
  console.log('calling open api async v8');
  const { Configuration, OpenAIApi } = require("openai");

  const configuration = new Configuration({
   apiKey: process.env.OPENAI_API_KEY,
  });
    
  const openai = new OpenAIApi(configuration);
  console.log('calimg open ai v10');

  const completion = openai.createCompletion({
    model: "text-davinci-003",
    prompt: "Please reply to the following: " + requestText,
  });
  console.log('after call await v8');
  completion.then((result) => {
    // console.log('data v10');
    // const data = result.data;
    // console.log('data v10');
    // console.log(data);
    // console.log('data data');
    // console.log(data.data);
    // console.log('choice');
    // console.log(data.choices[0].text);
  
    // console.log('text is ' + requestText);
    // console.log('response is' + data.choices[0].text);
    // // response = {
    // //   'text': `Hello from Jack Test for your origina text '${receivedMessage.text}'`
    // // };
    // const output =data.choices[0].text + " for sender " + senderPsid;
  
    // const response = {
    //   'text': output
    // };
    // console.log(response);
    // console.log('calling callSeender');
      // Send the response message
    // callSendAPI(senderPsid, response);
    console.log('before sen');
    callSendAPI(senderPsid,  {
      'text': 'whatsogonignongggg'
    });
    console.log('after sen');
  });
}

// Sends response messages via the Send API
function callSendAPI(senderPsid, response) {
  console.log("in call send API, changing message");
  // The page access token we have generated in your app settings
  const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

  // Construct the message body
  let requestBody = {
    'recipient': {
      'id': senderPsid
    },
    'message': response
  };
  console.log('response body');
  console.log(requestBody);

  // Send the HTTP request to the Messenger Platform
  request({
    'uri': 'https://graph.facebook.com/v2.6/me/messages',
    'qs': { 'access_token': PAGE_ACCESS_TOKEN },
    'method': 'POST',
    'json': requestBody
  }, (err, res, body) => {
    console.log('in request call back');

    if (!err) {
      console.log('Message sent!');
    } else {
      console.error('Unable to send message:' + err);
    }
    console.log('done ');
  });
}



// Handles messaging_postbacks events
function handlePostback(senderPsid, receivedPostback) {
  console.log('in postback');
  let response;

  // Get the payload for the postback
  let payload = receivedPostback.payload;

  // Set the response based on the postback payload
  if (payload === 'yes') {
    response = { 'text': 'Thanks!' };
  } else if (payload === 'no') {
    response = { 'text': 'Oops, try sending another image.' };
  } else {
    response = {'text': 'recevied one messageressponse back' };
  }
  // Send the message to acknowledge the postback

  callSendAPI(senderPsid, response);
}

// listen for requests :)
var listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});

function sendAttachment(attachmentUrl, senderPsid) {
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
