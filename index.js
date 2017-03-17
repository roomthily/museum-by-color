"use strict";

const ts = require('./tinyspeck.js'),
      axios = require('axios'),
      // load the supported CSS4 colors from Cooper Hewitt
      cooper_colors = require('./ch_css4.json');

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
  var color_obj = get_color(text);
  console.log('Extracted color: ' + color_obj.color);
  
  if (color_obj === undefined) {
    // it's an invalid mood
    send_response(response_url, payload.user_id, 'Unsupported mood ('+text+')! :/' );
    return;
  }

  // color = hex color without the hash
  var chkey = process.env.COOPER_HEWITT_TOKEN;

  // build the cooper hewitt request (get)
  var color_param = color_obj.color.slice(1);
  var the_url = `https://api.collection.cooperhewitt.org/rest/?method=cooperhewitt.search.objects&access_token=${chkey}&color=${color_param}&has_images=1&page=1&per_page=50`;
  
  var img_url;
  
  axios.get(the_url)
  .then(function(response){
    let data = response.data;
    
    let objs = data.objects;
    if (objs.length < 1) {
      send_response(response_url, payload.user_id, 'Oh no! No objects returned!');
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
    
    img.color = color_obj.color
    img.color_name = color_obj.name;
    
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
    var message = `Some art for feeling ${img.mood} (${img.color_name}).`;
    
    let attachments = {
      "fallback": message,
      "image_url":img.url,
      "date": date,
      "title_link": img.obj_url,
      "color": img.color,
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
    
    // respond to slack with the artwork
    send_response(response_url, payload.user_id, message, [attachments]);
  })
  .catch(function(err) {
    console.log('request error: ' + err.response.data);
    send_response(response_url, payload.user_id, 'I\'m sorry! Something happened trying to get the art!');
  });
  
});

function get_rand(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function send_response(response_url, user_id, message, attachments=[]) {
  let response = Object.assign({ channel: user_id, text: message, attachments: attachments });
  slack.send(response_url, response).then(res => { // on success
    console.log("Response sent to /museum slash command");
  }, reason => { // on failure
    console.log("An error occurred when responding to /museum slash command: " + reason);
  });
}

function get_color(mood) {
  // use the map (below) to get a color bin for the mood
  // and then select a random color from the bin
  // colors from the Cooper Hewitt CSS4 mappings:
  //    https://collection.cooperhewitt.org/objects/colors/palettes/css4/
  var color = mood_map.find(x=>x.feel.includes(mood));
  if (color === undefined) {
    return;
  }

  // grab one of the color objects
  var colors = cooper_colors[color.bin];
  var keys = Object.keys(colors);
  
  // get a random color
  var r = get_rand(0, keys.length-1);
  var k = keys[r];
  
  // remap the color for ease-of-use
  var item = {
    name: k,
    color: colors[k]
  };
  
  return item;
}

// mapping the feelings to a color set
// the bin is tied to the ch_css4.json
// add moods to the feel lists as you like
var mood_map = [
    {
        "bin": "pinks",
        'feel': ['caffeinated', 'anxious']
    },
    {
        "bin": "purples",
        "feel": ["electric", "eager"]
    },
    {
        "bin": "blues",
        "feel": ["focused", "relaxed", "relieved"]
    },
    {
        "bin": "greys",
        "feel": ["tired", "remote"]
    },
    {
        "bin": "lightblues",
        "feel": ["confused", "intrigued"]
    },
    {
        "bin": "greens",
        "feel": ["happy", "content", "satisfied"]
    },
    {
        "bin": "yellows",
        "feel": ["tense", "melancholy"]
    },
    {
        "bin": "tans",
        "feel": ["bummed", "hurt"]
    },
    {
        "bin": "oranges",
        "feel": ["giggly", "overwhelmed"]
    },
    {
        "bin": "reds",
        "feel": ["goofy", "delighted"]
    }
];
  
// incoming http requests
slack.listen('3000');