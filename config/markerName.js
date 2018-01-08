var User = require('../app/models/user');
var Location = require('../app/models/location');

module.exports = function getMarkerName(length, owner, lat, lng, address, callback) {
    var address = decodeURI(address);
    var text = "";
    var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHYJKLMNOPQRSTUVWXYZ0123456789";
    
    for(var i = 0; i < length; i++) {
        text += chars.charAt(Math.floor(Math.random() * chars.length));   
    }
    
    Location.findOne({name: text}, function(err, location) {
        if(err)
            return err;
        if(location) {
            getMarkerName(length, owner, lat, lng, address, callback);
        }
        else {
            var location = new Location({
                owner: owner._id,
                name: text,
                address: address,
                lat: lat,
                lng: lng
            });
            
            location.save(function(err) {
                if(err) return err;   
            });
            
            callback(text);
        }
    });
    
}