// strategy
var LocalStrategy = require('passport-local').Strategy;
// models
var User = require('../app/models/user');

module.exports = function(passport) {
    passport.serializeUser(function(user, done) {
        done(null, user.id); 
    });
    
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        }); 
    });
    
    passport.use('local-signup', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    }, function(req, email, password, done) {
        process.nextTick(function() {
            User.findOne({'email' : email}, function(err, user) {
                if(err)
                    return done(err);
                if(user)
                    return done(null, false, req.flash('signupMessage', 'Email already in use.'));
                else {
                    var newUser = new User();
                    
                    newUser.email = email;
                    newUser.password = newUser.generateHash(password);
                    
                    newUser.save(function(err) {
                        if(err)
                            throw err;
                        return done(null, newUser);
                    });
                    
                    req.login(newUser, function(err) {
                        if(err) return err;
                        res.redirect('/');
                    });
                }
            }); 
        });    
    }));
    
    passport.use('local-login', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true
    },
    function(req, email, password, done) {
        // find a user whose email is the same as the forms email
        User.findOne({ 'email':  email }, function(err, user) {
            if (err)
                return done(err);
            if (!user)
                return done(null, false, req.flash('loginMessage', 'User doesn\'t seem to exist.'));
            if (!user.validPassword(password))
                return done(null, false, req.flash('loginMessage', 'Oh no! Incorrect password. Please try again.'));
            return done(null, user);
        });

    }));
};