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

    Admin.findOne({ email: email }).then(admin => {
      if (admin) {
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
                .then(admin => {
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
    const userMap = {};
    users.forEach(function(user) {
      userMap[user._id] = user;
    });
    res.send(userMap);
  });
});

router.get('/dashboard/customers',function (req,res,next) {
  User.find({}, function(err, Users){
    if (err)
      return done(err);

    if (Users) {
      console.log(Users);
      res.render('admin/users', {
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
module.exports = router;
