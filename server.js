
const express = require('express');
const app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
const cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", (request,response)=>{
  response.sendFile(__dirname + '/views/index.html');
});

app.get('/stamp_of_time', (request,response)=>{
    response.sendFile(__dirname + '/views/pages/stamp_of_time.html');
});

// your first API endpoint... 
app.get("/api/:date?", (request, response)=>{
  let date;
  if(!request.params.date){
        date = new Date();
  }else{
        date = request.params.date;
  }
    let timeChecked;
    if(date == +date) timeChecked = +date;
    else timeChecked = date;
    
    const newDate = new Date(timeChecked);
    const unix = newDate.valueOf();
    const utc = newDate.toUTCString();

    if(isNaN(parseFloat(unix))){
        response.json({ error: utc })
    }else{
        response.json({ unix: unix, utc: utc });
    }
  
  
});



// listen for requests :)
const listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});