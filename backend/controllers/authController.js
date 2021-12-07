const User = require('../models/User');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');


exports.signup = (req, res) => {
  console.log('req.body', req.body); 
  const user = new User(req.body);
  user.save((error, user) => {
    console.log("inicio de sesion")
    if (error) {
      return res.status(400).json({
        error: "Por favor revisa, hay un error"
      })
    }
    user.salt = undefined;
    user.hashed_password = undefined;
    res.json({
      user
    })
  })
}


exports.signin = (req, res) => { 
  // find the user based on email
  const {email, password} = req.body
  User.findOne({email}, (error, user) => {
    if (error||!user) {
      return res.status(400).json({
        error: 'Este usuario no existe'
      });
    }
    // if user is found make sure the email and password match
    // create authenticate method in user model
    if (!user.authenticate(password)) {
      return res.status(401).json({
        error: 'Correo y contraseña no coinciden'
      });
    }
    const token = jwt.sign({_id:user._id}, process.env.JWT_SECRET)
    // persist the token as 't' in cookie with expiration date
    res.cookie('t', token, {expire: new Date() + 9999})
    // return response with user and token to frontend client
    const {_id, name, email, role} = user
    return res.json({token, user: {_id, email, name, role}})
  });
}

exports.signout = (req, res) => { 
  res.clearCookie('t')
  res.json({message: "Cerrado sesión satisfactorio"});
};

exports.userById = (req, res, next, id) => {
  User.findById(id).exec((err,user) => {
    if(err||!user) {
      return res.status(400).json({
        error: "Usuario no encontrado"
      });
    }
    req.profile = user;
    next()
  });
}