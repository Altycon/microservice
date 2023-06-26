const mongoose = require('mongoose');

const serviceUrlSchema = new mongoose.Schema({
    original_url: String,
    short_url: Number
});
const ServiceUrl = mongoose.model('ServiceUrl', serviceUrlSchema);
module.exports = ServiceUrl;