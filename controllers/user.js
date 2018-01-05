const User = require('../models/User');
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