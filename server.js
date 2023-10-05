require('dotenv').config();
require('./config/database.js').connectDatabase();

const express = require('express');
const dns = require('dns');

const upload = require('./upload.js'); // may be ./upload.js...

const { 
    generateShortUrl,
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
app.get('/file_metadata', (request, response) => {
    response.sendFile(__dirname + '/views/pages/file_metadata.html');
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
            response.json({ error: 'No url provided' });
        }
        const { shortUrl } = request.params;

        if(isNaN(shortUrl)){
            response.json({ error: 'invalid url type' });
        }
        
        const existingUrl = await getExistingUrl(shortUrl);

        if(existingUrl){
            response.redirect(existingUrl);
        }else{
            response.json({ error: 'url does not exist' });
        }
    }catch(error){
        console.log(error);
        response.redirect('/shorturl');
    }
});

app.post('/api/shorturl', async (request,response)=>{
    try{
        if(!request.body){
            response.json({ error: 'invalid url' });
        }
        
        const { url } = request.body;
        
        const requestedUrl = new URL(url);
       
        const hostname = requestedUrl.hostname;
       

        dns.resolve(hostname, 'A', async (error,addresses)=>{
            if(error || !addresses){
                console.log('Error resolving hostname', error);
                response.json({ error: 'invalid url' });
            }else{
                //addresses.forEach( address => console.log(address));
                
                const shortUrl = await generateShortUrl();

                await createAndSaveShortUrl(requestedUrl, shortUrl);
               
                response.json({ original_url: requestedUrl, short_url: shortUrl });
            }
        });
    }catch(error){
        response.json({ error: 'invalid url' });
    }
});

app.post('/api/filestats', upload.single('upfile'), (request,response)=>{
    // try this
    // https://www.freecodecamp.org/news/simplify-your-file-upload-process-in-express-js/
    try{

        
         //const { originalname, mimetype, size } = request.file;
         const filename = request.file.originalname || undefined;
         const mimetype = request.file.mimetype || undefined;
         const size = request.file.size || undefined;
         
         response.json({ name: filename, type: mimetype, size: size });
        
    }catch(error){
        response.json({ error: 'invalid file' });
    } 
});

// listen for requests :)
const listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});