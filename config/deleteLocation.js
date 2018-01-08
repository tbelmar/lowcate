var User = require('../app/models/user');
var Location = require('../app/models/location');

module.exports = function(lat, lng, user) {
    Location.findOneAndRemove({'lat': lat, 'lng': lng, owner: user._id}, function(err, location) {
        if(err) return err;
    });
}