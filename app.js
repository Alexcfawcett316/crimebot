var express = require('express');	
var bodyParser = require('body-parser');
var app = express();
var port = process.env.PORT || 3001;
var token = 'EAAHCBI4ojoIBACSZBblneqDKK0miZABfg572lJPmmSSvUwZChPLdpmdF1ZCNJQsqWc49moou4oZBgcrkGjAsVj93yIYYkh4iOlkAET46LX1bB0Kn8sHELMotLahsAZAznpAvWZCnDGo0VOTNSVE3u1IdfaebSfNvGGvPdxL5QNOfgZDZD';
var request = require("request");
var geocode = require("./geocoder");
var builder = require('botbuilder');
var connector = new builder.ConsoleConnector().listen();
var bot = new builder.UniversalBot(connector);

bot.dialog('/api/messages', function (session) {
    session.send('Hello World');
});

//app.use(bodyParser.urlencoded({extended: true}));

app.get('/geo', function (req, res) {
  try{
     var result = geocode.geocodeString('stannington');
     console.log('result.geomotry');
  }
  catch(err){
    //TODO: Handle multiple or no addresses
  }
});


app.get('/analyse', bodyParser.json(), function (req, res) {
  	request({
    url: 'https://data.police.uk/api/forces',
    method: 'GET'
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
    else{
        //var les = response.body.data;
        var forces = JSON.parse(response.body);
        for (var i = forces.length - 1; i >= 0; i--) {
             console.log(forces[i].id);
        };
        res.sendStatus(200);     
    }
  });
});

app.post('/webhook/', bodyParser.json(), function (req, res) {
 console.log('got message');
  messaging_events = req.body.entry[0].messaging;
  for (i = 0; i < messaging_events.length; i++) {
    event = req.body.entry[0].messaging[i];
    sender = event.sender.id;
    if (event.message && event.message.text) {
      text = event.message.text;
      sendTextMessage(sender, "Text received, echo: "+ text.substring(0, 200));
      console.log(text);
    }
  }
  res.sendStatus(200);
});

app.listen(port, function () {
  console.log('Example app listening on port 3001!');
});


function sendTextMessage(sender, text) {
  messageData = {
    text:text
  }
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:token},
    method: 'POST',
    json: {
      recipient: {id:sender},
      message: messageData,
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
  });
}