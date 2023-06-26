require('dotenv').config();
require('./config/database.js').connectDatabase();

const express = require('express');
const dns = require('dns');

//const ServiceUrl = require('./models/shorturl_model.js');
const { 
    createAndSaveShortUrl, 
    getExistingUrl 
} = require('./controllers/url_controller.js');

const app = express();


// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
const cors = require('cors');
app.use(cors({ optionsSuccessStatus: 200 }));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
    response.sendFile(__dirname + '/views/index.html');
});

/**
 * This is my stuf
 */

// enabling the use of the body in forms
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/stamp_of_time', (request, response) => {
    response.sendFile(__dirname + '/views/pages/stamp_of_time.html');
});
app.get('/whoami', (request, response) => {
    response.sendFile(__dirname + '/views/pages/whoami.html');
});
app.get('/shorturl', (request, response) => {
    response.sendFile(__dirname + '/views/pages/shorturl.html');
});

// your first API endpoint... 
app.get("/api/:property?", (request, response) => {

  if(request.params.property === 'whoami'){

      const ipaddress = request.ip;
      const software = request.headers['user-agent'];
      const language = request.headers['accept-language'];

      response.json({ ipaddress: ipaddress, language: language, software: software });

  }else{

      let date;
      if (!request.params.property) {
          date = new Date();
      } else {
          date = request.params.property
      }

      let timeChecked;
      if (date == +date) timeChecked = +date;
      else timeChecked = date;

      const newDate = new Date(timeChecked);
      const unix = newDate.valueOf();
      const utc = newDate.toUTCString();

      if (isNaN(parseFloat(unix))) {
          response.json({ error: utc })
      } else {
          response.json({ unix: unix, utc: utc });
      }
  }
});
app.get('/api/shorturl/:shortUrl?', async (request,response)=>{
    try{
        if(!request.params.shortUrl){
            throw new Error('No shorturl provided in url');
        }
        const { shortUrl } = request.params;

        // make sure short url is a number
        if(isNaN(shortUrl)){
            throw new Error('Invalid shorturl type');
        }
        console.log('shorturl-number', shortUrl);
        
        // check database for existing short url number
        // get original url associated with short url
        const existingUrl = await getExistingUrl(shortUrl);
        console.log('existingUrl', existingUrl);

        // redirect user to original url
        if(existingUrl){
            response.redirect(existingUrl);
        }
    }catch(error){
        console.log(error);
        response.json({ error: 'invalid shorturl' });
    }
});

app.post('/api/shorturl', (request,response)=>{
    try{
        if(!request.body){
            throw new Error('invalid url')
        }
        const body = request.body;
        body.url = body.url.trim();

        const requestedUrl = body.url;

        const shortUrl = Math.floor(Math.random()*1000);

        let split;
        if(requestedUrl.includes('://')){
            split = requestedUrl.split('://');
        }else{
            throw new Error('invalid url');
        }
        console.log('split', split);

        dns.resolve(split[1], 'A', (error,addresses)=>{
            if(error){
               throw new Error('invalid url');
            }else{
                addresses.forEach( address => console.log(address));
                
                // Here I need to save a model to mongo db

                createAndSaveShortUrl(requestedUrl, shortUrl);
                // const SHORTURL = new ServiceUrl({
                //     original_url: requestedUrl,
                //     short_url: shortUrl
                // });

                // SHORTURL.save();

                response.json({ original_url: requestedUrl, short_url: shortUrl});
            }
        });
    }catch(error){
        response.json({ error: 'invalid url' });
    }
   
    
    
   
})

// listen for requests :)
const listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});