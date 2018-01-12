'use strict'

module.exports = (app) => {
	const homeController = require('../controllers/home');

	// home route
	app.route('/')
		.get(homeController.index);
} 	
