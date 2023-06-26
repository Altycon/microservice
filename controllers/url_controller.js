const ServiceUrl = require('../models/shorturl_model.js');

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
    createAndSaveShortUrl,
    getExistingUrl
};