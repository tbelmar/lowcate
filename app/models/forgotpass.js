var mongoose = require('mongoose');

var forgotPassSchema = mongoose.Schema({
    owner: String,
    key: String,
    createdAt: {type: Date, expires: '1h', default: Date.now}
});

module.exports = mongoose.model('ForgotPass', forgotPassSchema);