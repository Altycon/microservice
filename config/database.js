require('dotenv').config();
const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

const MONGOOSE_OPTIONS = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};

module.exports.connectDatabase = async function (){
    try{
        await mongoose.connect(process.env.MONGODB_URI, MONGOOSE_OPTIONS);
        console.log('Mongo DB connected');
    }catch(error){
        console.log('MONGO_DB ERROR', error);
    }
};
