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
router.post('/login',function(req,res,next){

});
router.get('/logout',function (req,res,next){

});
router.get('/add-food-item',function (req,res,next){

});
router.post('/add-food-item',function (req,res,next){
  const {name,type,picture,price,action_name,action_time_from,action_time_to,action_price } = req.body;

});

router.get('/add-meni-item',function (req,res,next){

});
router.post('/add-meni-item',function (req,res,next){
  const {name,type,picture,price,action_name,action_time_from,action_time_to,action_price } = req.body;

});
router.get('/add-supplier',function (req,res,next){

});
router.post('/add-supplier',function (req,res,next){
  const {name,type,email,password,status,address } = req.body;

});

router.get('/order-confirm',function (req,res,next){

});
router.post('/order-confirm',function (req,res,next){

});
router.get('/assign-order',function (req,res,next){

});
router.post('/assign-order',function (req,res,next){

});

router.get('/edit',function (req,res,next){

});
router.post('/edit',function (req,res,next){
  const {name,type,email,password,status,address } = req.body;

});

module.exports = router;
