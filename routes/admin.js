const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const Admin = require('../models/Admin');
const User = require('../models/User');

const jwt = require('jsonwebtoken');
const {ensureAuthenticatedAdmin} = require('../config/auth');


router.get('/login', function(req, res, next) {
  res.render('admin/login');
});
router.get('/register', function(req, res, next) {
  res.render('admin/register');
});

router.post('/register',function (req,res,next){
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

    Admin.findOne({ email: email }).then(user => {
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
        const newAdmin = new Admin({
          name,
          email,
          password,
          address,
          status
        });
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newAdmin.password, salt, (err, hash) => {
            if (err) throw err;
            newAdmin.password = hash;
            newAdmin
                .save()
                .then(user =>{
                  req.flash(
                      'success_msg',
                      'You are now registered and can log in'
                  );
                  res.redirect('/admin/login');
                })
                .catch(err => console.log(err));
          });
        });
        console.log(newAdmin);
      }
    });
  }
});
router.post('/login',function (req,res,next){
  passport.authenticate('local', {
    successRedirect: '/admin/dashboard',
    failureRedirect: '/admin/login',
    failureFlash: true
  })(req, res, next);
  const maxAge = 3 *24 *60 *60 ;
  const createToken = (id) => {
    return jwt.sign({id},'strasno',{
      expiresIn: maxAge
    });
  }
  const token = createToken(Admin._id);
  res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });


});

// Logout
router.get('/logout', (req, res) => {
  res.cookie('jwt','',{maxAge: 1 });
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/admin/login');
});

router.get('/get-data',function (req,res,next) {
  User.find({}, function(err, users) {
    const userMap = {};
    users.forEach(function(user) {
      userMap[user._id] = user;
    });
    res.send(userMap);
  });
});

router.get('/customers',function (req,res,next) {
  User.find({}, function(err, Users){
    if (err)
      return done(err);

    if (Users) {
      console.log(Users);
      res.render('admin/users', {
        user: req.user,
        usersArray: Users
      });
    }
  });
});


router.get('/dashboard/customers/:id',function (req,res,next) {
  User.find({_id: req.params.id}, function(err, docs){
    if(err) res.json(err);
    else    res.json( {user: docs[0]._id});
  });
});

router.get('/add-restourant-admin',function (req,res,next){
  res.render('admin/add-restourant-admin');
})
/* GET home page. */
router.get('/dashboard',ensureAuthenticatedAdmin,function (req,res,next){
  res.render('admin/dashboard', {
    user: req.user
  })

});

router.put('/delete-customers/:id', (req, res) => {
  let userId = req.params.id,
    userParams = {
      status:true};
  User.findByIdAndUpdate(userId, {
    $set: userParams
  })
    .then(user => {
      res.locals.redirect = '/admin/customers';
      res.locals.user = user;

    })
    .catch(error => {
      console.log(`Error updating user by ID: ${error.message}`);

    });
});

module.exports = router;
