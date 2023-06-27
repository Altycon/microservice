const ServiceUrl = require('../models/shorturl_model.js');

async function generateShortUrl(){
    let shortUrl;
    let doesExist = true;
    try{
        while(doesExist){
            shortUrl = Math.floor(Math.random()*10000);
            doesExist = await ServiceUrl.exists({ short_url: shortUrl });
        }
        return shortUrl;
    }catch(error){
        console.log('ERROR Generating short url', error);
        throw new Error('Error generating short url');
    }
   
    
};

async function createAndSaveShortUrl(originalUrl,shortUrl){
    try{
        const SHORTURL = await new ServiceUrl({
            original_url: originalUrl,
            short_url: shortUrl
        });
    
        await SHORTURL.save();

    }catch(error){
        throw error;
    }
    
}
async function getExistingUrl(shortUrl){
    try{
        const foundUrl = await ServiceUrl.findOne({ short_url: shortUrl });
        return foundUrl.original_url;
    }catch(error){
        throw error;
    }
}
module.exports = {
    generateShortUrl,
    createAndSaveShortUrl,
    getExistingUrl
};