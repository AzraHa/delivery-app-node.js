const express = require('express');
const router = express.Router();
const passport = require('passport');

router.get('/',function (req,res,next){
  res.render('AdminRestaurant/login',{user:req.user});
});
router.get('/login',function (req,res,next){
  res.render('AdminRestaurant/login');
});
router.post('/login',function(req,res,next){
  passport.authenticate('adminLocal', {
    successRedirect: '/adminRestaurant/',
    failureRedirect: '/adminRestaurant/login',
    failureFlash: true
  })(req, res, next);
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
router.get('/add-sale',function (req,res,next){

});
router.post('/add-sale',function (req,res,next){
  const {name,type,email,password,status,address } = req.body;

});

router.get('/order-confirm',function (req,res,next){

});
router.post('/order-confirm',function (req,res,next){

});
router.get('/assign-order',function (req,res,next){

});



module.exports = router;
