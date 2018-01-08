var Location = require('../app/models/location'),
    ForgotPass = require('../app/models/forgotpass'),
    User = require('../app/models/user');

var getMarkerName = require('../config/markerName.js'),
    deleteLocation = require('../config/deleteLocation.js'),
    emailSettings = require('../config/email.js'),
    standardSettings = require('../config/standard.js');

var nodemailer = require('nodemailer'),
    bcrypt = require('bcrypt-nodejs'),
    Styliner = require('styliner'),
    styliner = new Styliner('../views/test.html'),
    fs = require('fs'),
    replace = require('stream-replace');

module.exports = function(app, passport) {
    app.get('/', function(req, res) {
        if(req.isAuthenticated()) {
            var userObj = {
                email: req.user.email
            };
            res.render('map.ejs', {
                user: userObj,
            });
        }
        else
            res.render('index.ejs', {message: req.flash('loginMessage')});
    });
    
    app.post('/login', passport.authenticate('local-login', {
        failureRedirect: '/',
        failureFlash: true
    }), function(req, res) {
        if(req.body.rememberMe)
            req.session.cookie.maxAge = 30*24*60*60*1000;
        res.redirect('/');
    });
    
    app.get('/register', isLoggedOut, function(req, res) {
        res.render('register.ejs', { message: req.flash('signupMessage') });   
    })
    
    app.post('/register', passport.authenticate('local-signup', {
        successRedirect: '/',
        failureRedirect: '/register',
        failureFlash: true
    }));
    
    app.get('/logout', logout, function(req, res) {
        res.redirect('/');
    });
    
    app.get('/forgot', function(req, res) {
        res.render('forgot.ejs');
    });
    
    app.post('/forgot', isLoggedOut, function(req, res) {
        var email = req.body.email;
        var text = "";
        var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHYJKLMNOPQRSTUVWXYZ0123456789";

        for(var i = 0; i < 64; i++)
            text += chars.charAt(Math.floor(Math.random() * chars.length));
        
        User.findOne({email: email}, function(err, user) {
            if(err)
                return err;
            if(user == null)
                res.render('forgot.ejs');
            else {
                var forgotPass = new ForgotPass({
                    owner: user._id,
                    key: bcrypt.hashSync(text, bcrypt.genSaltSync(8), null)
                });
                
                forgotPass.save(function(err) {
                    if(err) return err;
                });
                
                var transporter = nodemailer.createTransport({
                    host: emailSettings.host,
                    port: emailSettings.port,
                    secure: false,
                    auth: {
                        user: emailSettings.user,
                        pass: emailSettings.pass
                    }
                });
                
                var htmlStream = fs.createReadStream('../lowcate/views/email/forgotPass.html').pipe(replace(/{link}/g, standardSettings.domain + '/recover/' + user._id + '/' + text));

                var mailOptions = {
                    from: '"Password Bot"',
                    to: email,
                    subject: 'Lowcate Password Reset',
                    text: 'Lowcate Password Reset',
                    html: htmlStream
                };
                
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        return console.log(error);
                    }
                    console.log('Message sent: ' + info.messageId);
                });
                res.redirect('/');
            }
        });
    });
    
    app.get('/recover/:owner/:key', isLoggedOut, function(req, res) {
        var owner = req.params.owner;
        var key = req.params.key;
        
        ForgotPass.find({owner: owner}, function(err, keys) {
            if(err)
                return err;
            for(var i = 0; i < keys.length; i++) {
                var currKey = keys[i];
                if(bcrypt.compareSync(key, currKey.key))
                    res.render('recover.ejs');
                else if(i == keys.length-1)
                    res.redirect('/forgot');
            }
        });    
    });
    
    app.post('/recover', function(req, res) {
        var pass = decodeURI(req.body.password),
            owner = encodeURI(req.body.owner),
            key = req.body.key;
        ForgotPass.find({owner: owner}, function(err, keys) {
            if(err)
                return err;
            for(var i = 0; i < keys.length; i++) {
                var currKey = keys[i];
                if(bcrypt.compareSync(key, currKey.key)) {
                    User.update({_id: owner}, {$set: {password: bcrypt.hashSync(pass, bcrypt.genSaltSync(8), null)}}, function(err, numAffected) {
                        if(err)
                            throw err;
                    });
                }
                else if(i == keys.length-1)
                    res.redirect('/forgot');
            }
        });
    });
    
    app.get('/success', isLoggedIn, function(req, res) {
        res.render('success.ejs');
    });
    
    app.get('/l(/:location)?', function(req, res) {
        /^[a-zA-Z]+$/.test(req.params.location);
        res.render('locator.ejs', {display: req.params.location});
    });
    
    app.post('/getname', postIsLoggedIn, function(req, res) {
        getMarkerName(5, req.user, encodeURI(req.body.lat), encodeURI(req.body.lng), encodeURI(req.body.address), function(name) {
            res.send(name);
        })
    });
    
    app.post('/getlocals', postIsLoggedIn, function(req, res) {
        switch(encodeURI(req.body.var)) {
            case "saved_markers":
                Location.find({owner: req.user._id}, function(err, locations) {
                    if(err) return err;
                    if(locations)
                        res.send(locations);
                    else
                        res.send([]);
                });
                break;
            case "user":
                var userObj = {
                    email: req.user.email
                }
                res.send(userObj);
                break;
        }
    });
    
    app.post('/deletelocation', postIsLoggedIn, function(req, res) {
        deleteLocation(encodeURI(req.body.lat), encodeURI(req.body.lng), req.user);
        res.send();
    });
    
    app.post('/nametaken', function(req, res) {
        Location.findOne({name: encodeURI(req.body.name)}, function(err, location) {
            console.log(location);
            if(location)
                res.send(true);
            else
                res.send(false)
        });
    });
    
    app.post('/modifylocation', postIsLoggedIn, function(req, res) {
        switch(encodeURI(req.body.modifying)) {
            case "name":
                if(encodeURI(req.body.saved) == "true") {
                    Location.update({_id: encodeURI(req.body.id), owner: req.user._id}, {$set: {name: encodeURI(req.body.modifyingTo)}}, function(err, numAffected) {
                        if(numAffected)
                            res.send(true);
                        else
                            res.send(false);
                    });  
                }
                else {
                    Location.update({owner: req.user._id, lat: encodeURI(req.body.location.lat), lng: encodeURI(req.body.location.lng)}, {$set: {name: encodeURI(req.body.modifyingTo)}}, function(err, numAffected) {
                        if(numAffected)
                            res.send(true);
                        else
                            res.send(false);
                    });   
                }
                break;
        }
    });
    
    app.post('/getlocation', function(req, res) {
        var name = encodeURI(req.body.name);
        Location.findOne({name: name}, function(err, location) {
            if(err)
                return err;
            if(location)
                res.send(location);
            else
                res.send(null); 
        });
    });
}

function logout(req, res, next) {
    if(req.isAuthenticated()) {
        req.session.destroy();
        req.logout();
        delete req.session;
        return next();
    }
}

function postIsLoggedIn(req, res, next) {
    if(req.isAuthenticated())
        return next();
    
    res.status(500).send("Not logged in.");
}

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated())
        return next();
    
    res.redirect('/');
}

function isLoggedOut(req, res, next) {
    if(!req.isAuthenticated())
        return next();
    
    res.redirect('/')
}