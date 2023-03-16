const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const request = require('request');

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;; // Replace with your page access token
const GPT_API_KEY = process.env.OPENAI_API_KEY; // Replace with your ChatGPT API key


const app = express().use(bodyParser.json());

app.post('/webhook', (req, res) => {
  const body = req.body;
  console.log('in post webhook');
  if (body.object === 'page') {
    body.entry.forEach(entry => {
      const webhookEvent = entry.messaging[0];
      const senderId = webhookEvent.sender.id;
      console.log('sender id is ', senderId);
      if (webhookEvent.message) {
        handleMessage(senderId, webhookEvent.message);
      }
    });

    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

app.get('/hello', (req, res) => {
  // const VERIFY_TOKEN = 'YOUR_VERIFY_TOKEN'; // Replace with your verify token

    res.status(200).send("helo from jacksu");

});

app.get('/webhook', (req, res) => {
  // const VERIFY_TOKEN = 'YOUR_VERIFY_TOKEN'; // Replace with your verify token
  console.log("step1");
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  console.log("step2");
  if (mode && token) {
    console.log("step3");
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log("step4");
      res.status(200).send(challenge);
    } else {
      console.log("step5");
      res.sendStatus(403);
    }
    console.log("step6");
  }
  console.log("step7");
});

function handleMessage(senderId, message) {
  const text = message.text;
  console.log('in handle message', text);
  if (text) {
    axios.post('https://api.openai.com/v1/engines/davinci-codex/completions', {
      prompt: text,
      max_tokens: 50,
      n: 1,
      stop: null,
      temperature: 1,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    }, {
      headers: {
        'Authorization': `Bearer ${GPT_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }).then(response => {
      console.log('response got');
      const reply = response.data.choices[0].text.trim();
      console.log('reply is ', reply);
      sendTextMessage(senderId, reply);
    }).catch(error => {
      console.error('Error calling GPT API:', error);
    });
  }
}

function sendTextMessage(recipientId, text) {
  const messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: text
    }
  };

  request({
    uri: 'https://graph.facebook.com/v13.0/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData
  }, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      console.log('Message sent!');
    } else {
      console.error('Failed to send message:', error);
    }
  });
}

// app.listen(process.env.PORT || 1337, () => console.log('Webhook server is listening'));

// listen for requests :)
var listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
