const express = require('express');
const TotalOrder = require("../models/TotalOrder");
const Supplier = require("../models/Supplier");
const bcrypt = require('bcryptjs');
const passport = require('passport');
const moment = require('moment');
const jwt = require("jsonwebtoken"); // require
const router = express.Router();

router.get('/login',function (req,res,next){
  res.render('supplier/login');
});
router.post('/login',function(req,res,next){
  passport.authenticate('supplier', {
    successRedirect: '/supplier/dashboard',
    failureRedirect: '/supplier/login',
    failureFlash: true
  })(req, res, next);
  const maxAge = 3 *24 *60 *60 ;
  const createToken = (id) => {
    return jwt.sign({id},'strasno',{
      expiresIn: maxAge
    });
  }
  const token = createToken(Supplier._id);
  res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
});

router.get('/dashboard',function (req,res,next){
  res.render('supplier/dashboard');
});

router.get('/logout',function (req,res,next){
  res.cookie('jwt','',{maxAge: 1 });
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/supplier/login');
});

router.get('/orders',function (req,res,next){
//podaci o narudzbi,status,cijena,adresa,način plaćanja,gdje podize gdje dodtavlja,za koliko vremena
});
router.post('/orders',function (req,res,next){

});

router.get('/order-confirm',function (req,res,next){
  TotalOrder.find({supplier:req.user._id,status:2},function(err,orders){
    res.render('/orders',
      {user:req.user})
  });
});

module.exports = router;
