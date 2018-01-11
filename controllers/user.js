const passport = require('passport');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

/**
* GET /signup
* Signup Page
*/
exports.getSignup = (req, res) => {
	return res.render('account/signup', {
		title: 'Signup'
	});
};

/**
* GET /signin
* SignIn Page
*/
exports.getSignin = (req, res) => {
	return res.render('account/signin', {
		title: 'SignIn'
	});
}

/**
* POST /singup
*/
exports.postSignup = (req, res, next) => {
	req.assert('email', 'Email is not valid').isEmail();
	req.assert('password', 'Password cannot be blank').notEmpty();
	req.assert('confirmPassword', 'Password do not match').equals(req.body.password);
  	req.sanitize('email').normalizeEmail({ gmail_remove_dots: false });

  	const errors = req.validationErrors();

	if (errors) {
		req.flash('errors', errors);
	    return res.redirect('/signup');
	}

	const user = new User({
	    email: req.body.email,
	    password: req.body.password
	});
  	User.findOne({ email: req.body.email }, (err, existingUser) => {
		if(err) { console.log(err);  }
		if(existingUser) {
			req.flash('errors', { msg: 'Account with that email address already exists.' });
      		return res.redirect('/signup');
		}
		user.save((err) => {
	      if (err) { return next(err); }
	      req.logIn(user, (err) => {
	        if (err) {
	          return next(err);
	        }
	        res.redirect('/');
	      });
	    });
	});
}

/**
 * POST /login
 * Sign in using email and password.
 */
exports.postLogin = (req, res, next) => {
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password cannot be blank').notEmpty();
  req.sanitize('email').normalizeEmail({ gmail_remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/signin');
  }

  passport.authenticate('local', (err, user, info) => {
    if (err) { return next(err); }
    if (!user) {
      req.flash('errors', info);
      return res.redirect('/signin');
    }
    req.logIn(user, (err) => {
    	console.log(user);
      if (err) { return next(err); }
      req.flash('success', { msg: 'Success! You are logged in.' });
      res.redirect(req.session.returnTo || '/');
    });
  })(req, res, next);
 };

/**
* POST API_PREFIX+'signup' 
*/
exports.postApiSignup = (req, res) => {
	req.assert('email', 'Email is not valid').isEmail();
	req.assert('password', 'Password cannot be blank').notEmpty();
	req.assert('confirmPassword', 'Password do not match').equals(req.body.password);
  	req.sanitize('email').normalizeEmail({ gmail_remove_dots: false });

  	const errors = req.validationErrors();

	if (errors) {
	    res.json({'status': false, 'message': errors[0].msg});
	}

	const user = new User({
	    email: req.body.email,
	    password: req.body.password
	});
  	User.findOne({ email: req.body.email }, (err, existingUser) => {
		if(err) { console.log(err);  }
		if(existingUser) {
			res.json({'status': false, 'message': 'Account with that email address already exists.'});
		}
		user.save((err) => {
	      if (err) { return next(err); }
	      req.logIn(user, (err) => {
	        if (err) {
				res.json({'status': false, 'message': 'User not registered'});
	        }
	        res.json({'status': true, 'message': 'User registered successfully'});
	      });
	    });
	});
};

/**
* POST API_PREFIX+'signin' 
*/
exports.postApiSignin = (req, res, next) => {
	req.assert('email', 'Email is not valid').isEmail();
	req.assert('password', 'Password cannot be blank').notEmpty();
	req.sanitize('email').normalizeEmail({ gmail_remove_dots: false });

	const errors = req.validationErrors();

	if (errors) {
		req.flash('errors', errors);
		return res.redirect('/signin');
	}


	User.findOne({email: req.body.email}, (err, user) => {

		if (err) { console.log(err);res.status(401).json({'status': false, 'message': `invalid request`}); }
	    if (!user) {
	    	res.status(401).json({'status': false, 'message': `Email ${email} not found.`});
	    }
	    user.comparePassword(req.body.password, (err, isMatch) => {
	      	if (err) { console.log(err); res.status(401).json({'status': false, 'message': 'Invalid email or password.'});}
		    if (isMatch) {
		      	console.log("Yes matched");
		      	const payload = {email: user.email};
				const token = jwt.sign(user.email, process.env.JWT_SECRET);
				res.status(200).json({'status': true, 'message': 'user data', data: user, token: token});
			} else {
		      	res.status(401).json({'status': false, 'message': 'Invalid email or password.'});
		    }
	    });  

	});

 };

