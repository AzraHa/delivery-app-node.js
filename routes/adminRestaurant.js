const express = require('express');
const router = express.Router();
const passport = require('passport');
const RestaurantAdmin = require('../models/RestaurantAdmin');

router.get('/',function (req,res,next){
  res.render('AdminRestaurant/dashboard');
});
router.get('/login',function (req,res,next){
  res.render('AdminRestaurant/login');
});
router.get('/logout',function (req,res,next){

});


module.exports = router;
