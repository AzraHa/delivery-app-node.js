const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const Admin = require('../models/Admin');
const User = require('../models/User');
var mongoose = require('mongoose');

/* GET home page. */
router.get('/dashboard',function (req,res,next){
  res.render('admin/dashboard');
});
router.get('/login', function(req, res, next) {
  res.render('admin/login');
});
router.get('/register', function(req, res, next) {
  res.render('admin/register');
});

router.post('/register',function (req,res,next){
  const {name, email, password, password2, address} = req.body;
  let errors = [];

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
          address
        });
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newAdmin.password, salt, (err, hash) => {
            if (err) throw err;
            newAdmin.password = hash;
            newAdmin
                .save()
                .then(user => {
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
});

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/admin/login');
});

router.get('/get-data',function (req,res,next) {
  User.find({}, function(err, users) {
    var userMap = {};
    users.forEach(function(user) {
      userMap[user._id] = user;
    });
    res.send(userMap);
  });
});


module.exports = router;
