var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var server = require('http').createServer(app);

// middleware
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

// config settings
var configDB = require('./config/database.js');
var configStandard = require('./config/standard.js');

require('./config/passport')(passport);

// config db
mongoose.connect(configDB.url);

// set up express
app.use(express.static(__dirname));
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser());

app.set('view engine', 'ejs');

// passport settings
app.use(session({ secret: configStandard.secret_key }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// routes
require('./app/routes.js')(app, passport);

// start app
server.listen(port);
console.log("Listening on port " + port);