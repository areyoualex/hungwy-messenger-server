const moment = require('moment');
const jwt = require('jsonwebtoken');
const User = require('./models/user.js');

// Import routes
const Auth = require('.controllers/auth.js');

function ensureAuthenticated(req, res, next) {
  if (!req.headers.authorization) {
    return res.status(401).send({ error: 'TokenMissing' });
  }
  var token = req.headers.authorization.split(' ')[1];

  var payload = null;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  }
  catch (err) {
    return res.status(401).send({ error: "TokenInvalid" });
  }

  if (payload.exp <= moment().unix()) {
    return res.status(401).send({ error: 'TokenExpired' });
  }
  // check if the user exists
  User.findById(payload.sub, function(err, person){
    if (!person){
      return res.status(401).send({error: 'PersonNotFound'});
    } else {
      req.user = payload.sub;
      next();
    }
  });
};

// Add routes/endpoints to server
module.exports = (app) => {
  // Authentication routes
  app.post('/auth/login', Auth.login);
  app.post('/auth/signup', Auth.signup);
}
