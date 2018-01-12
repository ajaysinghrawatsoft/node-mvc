/*
* Module dependencies
*/
const express = require('express');
const dotenv = require('dotenv');
const expressStatusMonitor = require('express-status-monitor');
const compression = require('compression');
const path = require('path');
const sass = require('node-sass-middleware');
const logger = require('morgan');
const chalk = require('chalk');
const errorHandler = require('errorhandler');
const expressValidator = require('express-validator');
const bodyParser = require('body-parser');
const flash = require('express-flash');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

/*
* Load environment variable from the file 
*/
dotenv.load({load : '.env'});

/*
* Create express server
*/
const app = express();

/**
 * Connect to MongoDB.
 */
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI);
mongoose.connection.on('error', (err) => {
  console.error(err);
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
  process.exit();
});

/*
* Express Configuration
*/
app.set('host', process.env.SERVER_IP || '0.0.0.0');
app.set('port', process.env.PORT || 8080);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(expressStatusMonitor());
app.use(compression());
app.use(sass({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public')	
}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
app.use(expressValidator());
app.use(session({
	resave: true,
  	saveUninitialized: true,
  	secret: process.env.SESSION_SECRET,
  	store: new MongoStore({
    	url: process.env.MONGODB_URI || process.env.MONGOLAB_URI,
    	autoReconnect: true,
    	clear_interval: 3600
  	})
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));



/**
 * Primary app routes.
 */
/*app.get('/', homeController.index);
app.get('/signup', userController.getSignup);
app.get('/signin', userController.getSignin);
app.post('/signup', userController.postSignup);
app.post('/signin', userController.postLogin);*/

//var routes = require('./routes/userRoutes');
//var routes = require('./routes/homeRoutes');;
/**
* Middleware to verify authorised request
*/
app.use((req, res, next) => {
  if(req.headers && req.headers.authorization) {
    jwt.verify(req.headers.authorization, process.env.JWT_SECRET, (err, decode) => {
      if(err) {req.user = undefined; console.log(err);}
      req.user = decode;
      console.log(req.user);
      next();
    });
  } else {
    req.user = undefined;
    next();
  }
});

app.use(require('./routes'));

/*app.get('/tasks', userController.loginRequired,(req, res) => {
  console.log("yes authorized");
});*/

/**
 * API keys and Passport configuration.
 */
const passportConfig = require('./config/passport');

 /**
 * Error Handler.
 */
app.use(errorHandler());

/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
  console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), app.get('port'), app.get('env'));
  console.log('  Press CTRL-C to stop\n');
});

module.exports = app;

