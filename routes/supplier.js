const express = require('express');
const router = express.Router();


router.get('/',function (req,res,next){
  res.render('supplier/dashboard');

});
router.get('/login',function (req,res,next){
  res.render('supplier/login');
});
router.post('/login',function(req,res,next){

});
router.get('/logout',function (req,res,next){

});

router.get('/orders',function (req,res,next){
//podaci o narudzbi,status,cijena,adresa,način plaćanja,gdje podize gdje dodtavlja,za koliko vremena
});
router.post('/orders',function (req,res,next){

});

router.get('/orders-confirmation',function (req,res,next){
//slanje podataka administratoru
});

module.exports = router;
