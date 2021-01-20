const express = require('express');
const router = express.Router();
const passport = require('passport');
const Food = require('../models/Food');
const upload = require('../controllers/uploadController');
const FoodType = require('../models/FoodType');

router.get('/',function (req,res,next){
  res.render('AdminRestaurant/login',{user:req.user});
});
router.get('/dashboard',function (req,res,next){
  res.render('AdminRestaurant/dashboard',{user:req.user});
});
router.get('/login',function (req,res,next){
  res.render('AdminRestaurant/login');
});
router.post('/login',function(req,res,next){
  passport.authenticate('adminLocal', {
    successRedirect: '/adminRestaurant/dashboard',
    failureRedirect: '/adminRestaurant/login',
    failureFlash: true
  })(req, res, next);
});
router.get('/logout',function (req,res,next){
  res.cookie('jwt','',{maxAge: 1 });
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/');
});
router.get('/admin',function (req,res,next){
res.render('AdminRestaurant/admin',{user:req.user});
});

router.get('/add-food-item',function (req,res,next){

  FoodType.find({},function (err,foodtype){
    if(err) console.log(err);
    else{
      res.render('AdminRestaurant/add-food-item',{
        user:req.user,
        FoodTypeArray:foodtype
      });
    }
  })
});
router.post('/add-food-item',upload.single('picture'),function (req,res,next){
  const {name,type,price} = req.body;
  const picture = req.file.filename;
  const status = true;
  const meni = false;
  const description = req.body.desc;
  const newFoodItem = new Food(
    {
        name, type, price,picture,status,meni,description
        }
    );
    newFoodItem.save().then(user =>
    {
      res.redirect('/adminRestaurant/food');
    });
});

router.get('/add-restaurant-admin',function (req,res,next){
  res.render('AdminRestaurant/add-restaurant-admin',{user:req.user});
});
router.get('/add-meni',function (req,res,next){
  FoodType.find({},function (err,foodtype){
    if(err) console.log(err);
    else{
      res.render('AdminRestaurant/add-meni',{
        user:req.user,
        FoodTypeArray:foodtype
      });
    }
  })
});

router.post('/add-meni',upload.single('picture'),function (req,res,next){
  const {name,type,price} = req.body;
  const picture = req.file.filename;
  const status = true;
  const meni = true;
  const description = req.body.desc;
  console.log(name,type,picture,status,meni,description);
  const newFoodItem = new Food(
      {
        name, type, price,picture,status,meni,description
      }
  );
  newFoodItem.save().then(user =>
  {
    res.redirect('/adminRestaurant/food');
  });
});

router.get('/customers',function (req,res,next){
  res.render('AdminRestaurant/customers',{user:req.user});

});
router.get('/food',function (req,res,next){
  Food.find({})//sve restorane sa suppliers
    .populate('type') // only works if we pushed refs to person.eventsAttended
    .exec(function(err, food) {
      console.log(food);
      if (err) console.log(err);
      res.render('adminRestaurant/food', {
        user: req.user,
        foodArray: food
      });
    });
});
router.get('/add-suppliers',function (req,res,next){
  res.render('AdminRestaurant/add-suppliers',{user:req.user});
});
router.post('/add-supplier',function (req,res,next){
  const {name,type,email,password,status,address } = req.body;

});
router.get('/add-sale',function (req,res,next){
  res.render('AdminRestaurant/add-sale',{user:req.user});
});
router.post('/add-sale',function (req,res,next){
  const {name,type,email,password,status,address } = req.body;

});

router.get('/order-confirm',function (req,res,next){
  res.render('AdminRestaurant/order-confirm',{user:req.user});
});
router.get('/orders',function (req,res,next){
  res.render('AdminRestaurant/orders',{user:req.user});
});
router.get('/suppliers',function (req,res,next){
  res.render('AdminRestaurant/suppliers',{user:req.user});
});
router.get('/sale',function (req,res,next){
  res.render('AdminRestaurant/sale',{user:req.user});
});
router.post('/order-confirm',function (req,res,next){

});
router.get('/assign-order',function (req,res,next){
  res.render('AdminRestaurant/admin',{user:req.user});
});



module.exports = router;
