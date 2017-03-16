"use strict";

const ts = require('./tinyspeck.js'),
      axios = require('axios');

var slack = ts.instance({ });
var connected=false;

//
// For each Slash Command that you want to handle, you need to add a new `slack.on()` handler function for it.
// This handler captures when that particular Slash Command has been used and the resulting HTTP request fired
// to your endpoint. You can then run whatever code you need to for your use-case. 
//
// The `slack` functions like `on()` and `send()` are provided by `tinyspeck.js`. 
//
// Watch for /museum slash command
slack.on('/museum', payload => {
  console.log("Received /museum slash command from user " + payload.user_id);
  let user_id = payload.user_id;
  let response_url = payload.response_url;
  
  let text = payload.text;
  // not the greatest parsing
  text = text.toLowerCase().split('!')[1]
    .replace('i\'m feeling ', '')
    .replace(' ', '')
    .replace('.', ''); 
  
  console.log('Extracted mood: ' + text);
  
  // sort out a color from the provided text
  var color = get_color(text);
  console.log('Extracted color: ' + color);
  
  if (color === undefined) {
    // it's an invalid mood
    let response = Object.assign({ channel: payload.user_id, text: 'Unsupported mood ('+text+')! :/' });
    slack.send(response_url, response).then(res => { // on success
      console.log("Response sent to /museum slash command");
    }, reason => { // on failure
      console.log("An error occurred when responding to /museum slash command: " + reason);
    });
  }

  // color = hex color without the hash
  var chkey = process.env.COOPER_HEWITT_TOKEN;

  // build the cooper hewitt request (get)
  var the_url = `https://api.collection.cooperhewitt.org/rest/?method=cooperhewitt.search.objects&access_token=${chkey}&color=${color}&has_images=1&page=1&per_page=50`;
  
  var img_url;
  
  axios.get(the_url)
  .then(function(response){
    let data = response.data;
    console.log('number of objects: ' + data.objects.length);
    
    let objs = data.objects;
    if (objs.length < 1) {
      return;
    }
    
    // get a random object from the search
    let r = get_rand(0, objs.length-1);
    
    let obj = objs[r];
    console.log('title: ' + obj.title);
    
    let imgs = obj.images[0];
    
    // not 100% how reliable the "n" key is
    let img = imgs.n;
    
    img.mood = text;
    img.title = obj.title;
    img.date = obj.date;
    img.obj_url = obj.url;
    img.accession = obj.accession_number;
    
    img.color = color;
    
    // snag the creator
    let participant = obj.participants.find(x=>x.role_name==='Producer');
    if (participant !== undefined) {
      img.producer = participant.person_name;
      img.producer_url = participant.person_url;
    }

    return img;
  })
  .then(function(img) {
    // img = dict of img properties, modified with obj bits
    //       for the identification
    
    var title = (img.title !== undefined) ? img.title : 'Title Unknown';
    var date = (img.date !== undefined && img.date !== null) ? img.date : 'Unknown';
    var creator = (img.producer !== undefined) ? img.producer : 'Artist Unknown';
    var acc = (img.accession !== undefined) ? img.accession : 'Unknown';
    
    var fallback = `${title} (${date}); ${creator} (Accession Number: ${acc})`;
    var message = `Some art for feeling ${img.mood}.`;
    
    let attachments = {
      "fallback": message,
      "image_url":img.url,
      "date": date,
      "title_link": img.obj_url,
      "color": '#' + img.color,
      "title": title,
      "fields": [
        {
          "title": 'Producer',
          "value": creator,
          "short": true
        },
        {
          "title": 'Accession Number',
          "value": acc,
          "short": true
        },
        {
          "title": 'Date',
          "value": date,
          "short": true
        },
      ],
      "footer": 'Thanks, Cooper Hewitt!'
    };
    if (img.producer !== undefined) {
      attachments['author_name'] = img.producer;
      attachments['author_link'] = img.producer_url;
    }
    
    let response = Object.assign({ channel: payload.user_id, text: message, attachments: [attachments] });
    slack.send(response_url, response).then(res => { // on success
      console.log("Response sent to /museum slash command");
    }, reason => { // on failure
      console.log("An error occurred when responding to /museum slash command: " + reason);
    });
  })
  .catch(function(err) {
    console.log('request error: ' + err.response.data);
  });
  
});

function get_color(mood) {
  // just making up these now
  var d = {
    "happy": ['27B84D', '407D50', '5BDEB2', '70CC83', '237D6C'], //greens
    "bummed": ['633660', '541950', '764280', '8C0E84'], // grey purples
    "electric": ['D5FF3D', 'FF00EE'],
    "stoked": ['05EBF7', '0AFFE7'], // vibrant blue
    "goofy": ['FFDD00','FFFF00', 'FFE53D'], // yellows
    "giggly": ['FFC60A', 'FF7300'], // oranges
    "remote": ['AABFBB', '99B1BF', '5C6D78', '92789C', '777A63'], //steely grey
    "tired": ['E3D94D', 'C9C7A5', 'A5C3C9'],
    "caffeinated": ['F21B37', 'CC021D', 'FF006A', 'FF4D00', 'FF1100'], // bright reds
    "focused": ['50A2B5', '6F8BC7', '1029E6', '056FE8'], 
    "relaxed": ['14A3A1', '148BA3', '1E7BC7', '74B1E3'],
    "tense": ['755E91', '915E61', '5E9190']
  };
  // console.log(d[mood]);
  var i = get_rand(0, d[mood].length-1);
  return d[mood][i];
}

function get_rand(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
  
// incoming http requests
slack.listen('3000');