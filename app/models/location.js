var mongoose = require('mongoose');

var locationSchema = mongoose.Schema({
    owner: String,
    name: String,
    address: String,
    lat: String,
    lng: String
});

module.exports = mongoose.model('Location', locationSchema);