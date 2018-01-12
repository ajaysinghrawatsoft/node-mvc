'use strict'


module.exports = (app) => {

  const userController = require('../controllers/user');

  // user routes
  app.route(process.env.API_PREFIX+'signin')
    .post(userController.postApiSignin);

  app.route(process.env.API_PREFIX+'signup')
    .post(userController.postApiSignup);

}