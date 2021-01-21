const User = require('../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const jwt = require('jsonwebtoken');

//Create token
const maxAge = 3 *24 *60 *60 ;
const createToken = (id) => {
    return jwt.sign({id},'strasno',{
        expiresIn: maxAge
    });
}
//Index page user
module.exports.index = (req,res,next) => {
  res.render('dashboard', {title: 'POST test'});
}

//Login page
module.exports.login_get = (req,res) => {
    res.render('login');
}
//Registration page
module.exports.registration_get = (req,res) => {
    res.render('register');
}

//Registration form
module.exports.registration_post = async (req,res) => {
  const {name, email, password, password2, address} = req.body;
  let errors = [];
  const status = true;
  if (!name || !email || !password || !password2 || !address) {
    errors.push({msg: 'Please enter all fields'});
  }

  if (password != password2) {
    errors.push({msg: 'Passwords do not match'});
  }

  if (password.length < 6) {
    errors.push({msg: 'Password must be at least 6 characters'});
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
      password,
      password2,
      address

    });
  }else {
    User.findOne({ email: email }).then(user => {
      if (user) {
        errors.push({ msg: 'Email already exists' });
        res.render('register', {
          errors,
          name,
          email,
          password,
          password2,
          address
        });
      } else {
        const newUser = new User({
          name,
          email,
          password,
          address,
          status
        });
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                req.flash(
                  'success_msg',
                  'You are now registered and can log in'
                );
                res.redirect('/users/login');
              })
              .catch(err => console.log(err));
          });
        });
        console.log(newUser);
      }
    });
  }
}

//Login form
module.exports.login_post = (req,res,next) => {
  passport.authenticate('userLocal', function (err, user) {
    req.logIn(user, function (err) { // <-- Log user in
      /*res.locals.user = user;
      return res.render('error');*/
      return res.redirect('/users/dashboard');
    });
  })(req, res);

}

//Logout function
module.exports.logout = (req,res,next) => {
  res.cookie('jwt','',{maxAge: 1 });
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
}


module.exports.dashboard = (req,res,next) => {
passport.authenticate('jwt',{session: false}),function (req,res,next){
    console.log(req.cookies);
    res.render('dashboard');
  }
}
