var express = require('express');	
var bodyParser = require('body-parser');
var app = express();
var port = process.env.PORT || 3001;
var token = 'EAAHCBI4ojoIBACSZBblneqDKK0miZABfg572lJPmmSSvUwZChPLdpmdF1ZCNJQsqWc49moou4oZBgcrkGjAsVj93yIYYkh4iOlkAET46LX1bB0Kn8sHELMotLahsAZAznpAvWZCnDGo0VOTNSVE3u1IdfaebSfNvGGvPdxL5QNOfgZDZD';
var request = require("request");
var geocode = require("./geocoder");
var builder = require('botbuilder');

var connector = new builder.ChatConnector({
    appId: "4998908b-6e9d-4e25-a376-67a5546a6c17",
    appPassword: "vt6PMmXVazm1shYNQJ78hQH"
});

var bot = new builder.UniversalBot(connector);


app.post('/api/messages', connector.listen());


bot.dialog('/', [
    function (session) {
        session.beginDialog('/getLocation', session.userData.location);
    },  
    function (session, results) {
        session.userData.location = results.response;
        if(typeof session.userData.location.codedLocation == 'undefined'){
          session.send('Sorry but I couldn\'t find %(enteredName)s', session.userData.location); 
        }
        else{
          session.send('gotcha');
        }
    }
]);

bot.dialog('/getLocation', [
   function (session, args, next) {
        session.dialogData.location = args || {};
        builder.Prompts.text(session, "Where about in the UK are you?");    
    },
    function (session, results, next) {
        if (results.response) {
            session.dialogData.location.enteredName = results.response;
        }
        geocode.geocodeString(session.dialogData.location.enteredName, function(result){
          console.log(result.length);
          if(result.length == 0){
            //no locations. end
            session.endDialogWithResult({ response: session.dialogData.location });
          }
          else if(result.length == 1){
             //1 location retured, we're good to go
             session.dialogData.location.codedLocation = result[0];
             session.endDialogWithResult({ response: session.dialogData.location });
          }
          else if(result.length > 1){
              //more than 1 location, need to dedupe
              session.dialogData.location.codedLocations = result;
              next();
          }
          
        });
        
    },
    function (session) {
        session.beginDialog('/decideMultiple', session.dialogData.location);
    },  
    function (session, results) {
      //end this part    
    }
]);

bot.dialog('/decideMultiple', [
    function (session, args, next){
      var choices = [];
        for (var i = 0; i < args.codedLocations.length; i++) {
            choices.push(args.codedLocations[i].formatted_address);
        }
        builder.Prompts.choice(session, "I've found a few that match those, which one is it?", choices);
    },  
    function (session, results) {
      //end this part    
    }
]);

//app.use(bodyParser.urlencoded({extended: true}));

app.get('/geo', function (req, res) {
  try{
     //var result = geocode.geocodeString('stannington');
     //console.log(result.geomotry);
  }
  catch(err){
    //TODO: Handle multiple or no addresses
  }
});


app.get('/test', function (req, res) {
  res.sendStatus(200);   
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