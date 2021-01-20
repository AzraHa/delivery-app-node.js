const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcryptjs');
const Food = require('../models/Food');
const upload = require('../controllers/uploadController');
const FoodType = require('../models/FoodType');
const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const Supplier = require("../models/Supplier");
const RestaurantAdmin = require("../models/RestaurantAdmin");
const Sale = require("../models/Sale");
const moment = require('moment');

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
  RestaurantAdmin.find({restaurant:req.user.restaurant}).populate('restaurant').exec(function(err,restAdmin){
    //console.log(restAdmin);
    res.render('AdminRestaurant/admin',{user:req.user,restAdmin:restAdmin});
  });
});
router.get('/admin/:id',function(req,res,next){
  const adminID = req.params.id;
  RestaurantAdmin.find({_id:adminID},function(err,admin){
    res.render('adminRestaurant/restAdmin',{
      user: req.user,
      admin : admin
    });
  })
});

router.post('/admin/edit/:id',function(req,res,next){
  const adminID = req.params.id;
  const restaurant = req.user.restaurant;
  const adminName = req.body.adminName;
  const address = req.body.address;
  const adminEmail = req.body.adminEmail;
  const status = req.body.status;
  const password = req.body.password;
  const modified = moment(new Date).format("MM/DD/YYYY, h:mm:ss");

  if (password === ""){
    RestaurantAdmin.updateOne({ _id: adminID},  {
          status: status ,
          restaurant:restaurant,
          modified:modified,
          name:adminName,
          email:adminEmail,
          address:address,
        },
        function (error, success) {
          res.redirect('/adminRestaurant/admin');
        });
  }else{
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) throw err;
        RestaurantAdmin.updateOne({ _id: adminID},  {
              status: status ,
              password : hash,
              restaurant:restaurant,
              modified:modified,
              name:adminName,
              email:adminEmail,
              address:address,
            },
            function (error, success) {
              res.redirect('/adminRestaurant/admin');
            });
      });
    });
  }
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
router.get('/food/:id',function(req,res,next){
  const foodID = req.params.id;
  Food.find({_id: foodID}).populate('type').exec(function(err,food){
    FoodType.find({},function (err,ftype){
      res.render('adminRestaurant/foodItem',{
        user:req.user,
        food:food,
        FoodTypeArray: ftype
      });
    })

  });
});
router.post('/food/edit/:id',function (req,res,next){
  const foodID = req.params.id;
  const {name,type,price,status} = req.body;
  console.log(name,type,price);
  const modified = moment(new Date).format("MM/DD/YYYY, h:mm:ss");
  Food.updateOne({ _id: foodID},  {
        status: status,
        modified:modified,
        name:name,
        type:type,
        price:price
      },
      function (error, success) {
        res.redirect('/adminRestaurant/food');
      });
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


router.get('/add-restaurant-admin',function (req,res,next){
  res.render('AdminRestaurant/add-restaurant-admin',{user:req.user});
});
router.post('/add-restaurant-admin',function (req,res,next){
  const restaurant = req.user.restaurant;
  const {adminName,adminEmail,password,address} = req.body;
  const status = true;
  const newAdmin = new RestaurantAdmin({
    name: adminName,
    email: adminEmail,
    restaurant : restaurant,
    address: address,
    status: status
  });
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
      if (err) throw err;
      newAdmin.password = hash;
      newAdmin.save();
    });
  });
  Restaurant.updateOne({ _id: restaurant}, {
    $push: {
      admin: {
        _id : newAdmin._id
      }
    }},
      function (error, success) {
    res.redirect('/adminRestaurant/admin');
  });

});


router.get('/customers',function (req,res,next){
  const restaurant = req.user.restaurant;
  User.find({restaurant:restaurant},function(err,customer){
    res.render('AdminRestaurant/customers',{user:req.user,customer:customer});
  });
});
router.get('/orders',function (req,res,next){
  res.render('AdminRestaurant/orders',{user:req.user});
});
router.get('/order-confirm',function (req,res,next){
  res.render('AdminRestaurant/order-confirm',{user:req.user});
});
router.post('/order-confirm',function (req,res,next){

});
router.get('/assign-order',function (req,res,next){
  res.render('AdminRestaurant/admin',{user:req.user});
});


router.get('/suppliers',function (req,res,next){
  Supplier.find({restaurant:req.user.restaurant},function (err,suppliers){
    res.render('AdminRestaurant/suppliers',{user:req.user,suppliers:suppliers});
  });
});
router.get('/suppliers/:id',function (req,res,next){
  const supplierID = req.params.id;
  Supplier.find({_id:supplierID},function(err,supplier){
    res.render('AdminRestaurant/supplier',{
      user: req.user,
      supplier: supplier
    })
  })
});
router.post('/suppliers/edit/:id',function (req,res,next){
  const supplierID = req.params.id;
  const {name,address,email,status,password} = req.body;
  const modified = moment(new Date).format("MM/DD/YYYY, h:mm:ss");
  console.log("PODACI: "+name+address+email+status+password);
  if (password === ""){
    Supplier.updateOne({ _id: supplierID},  {
          status: status ,
          modified:modified,
          name:name,
          email:email,
          s_address:address
        },
        function (error, success) {
          res.redirect('/adminRestaurant/suppliers');
        });
  }else{
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) throw err;
        Supplier.updateOne({ _id: supplierID},  {
              status: status ,
              password : hash,
              modified:modified,
              name:name,
              email:email,
              s_address:address
            },
            function (error, success) {
              res.redirect('/adminRestaurant/suppliers');
            });
      });
    });
  }

});
router.get('/add-supplier',function (req,res,next){
  res.render('AdminRestaurant/add-suppliers',{user:req.user});
});
router.post('/add-supplier',function (req,res,next){
  const {name,email,address,password} = req.body;
  const status = true;
  const newSupplier = new Supplier({
    name:name,
    email:email,
    s_address:address,
    restaurant:req.user.restaurant,
    status:status
  });
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
      if (err) throw err;
      newSupplier.password = hash;
      newSupplier.save();
    });
  });
  Restaurant.updateOne({ _id: req.user.restaurant}, {
    $push: {
      suppliers: {
        _id : newSupplier._id
      }
    }},
      function (error, success) {
        res.redirect('/AdminRestaurant/suppliers');
  });
});


router.get('/add-sale',function (req,res,next){
  FoodType.find({},function (err,foodType){
    res.render('AdminRestaurant/add-sale',{
      user:req.user,
      FoodTypeArray:foodType
    });
  });
});
router.post('/add-sale',upload.single('picture'),function (req,res,next){
  const {name,type,desc,price,date_from,date_to } = req.body;
  const picture = req.file.filename;
  const status = true;
  const newSale = new Sale({
    name:name,
    type:type,
    description:desc,
    salePrice:price,
    date_from:date_from,
    date_to:date_to,
    picture:picture,
    status:status,
    restaurant:req.user.restaurant
  });
  newSale.save().then(user =>
  {
    res.redirect('/adminRestaurant/sale');
  });
});
router.get('/sale',function (req,res,next){
  Sale.find({restaurant:req.user.restaurant}).populate('type').exec(function(err,sale){
    res.render('AdminRestaurant/sale',{
      user:req.user,
      sale:sale
    });
  })
});
router.get('/sale/:id',function (req,res,next){
  const saleID = req.params.id;
  Sale.find({_id: saleID}).populate('type').exec(function(err,sale) {
    FoodType.find({}, function (err, ftype) {
      res.render('adminRestaurant/saleItem', {
        user: req.user,
        sale: sale,
        FoodTypeArray: ftype
      });
    });
  });
});

router.post('/sale/edit/:id',function (req,res,next){
  const saleID = req.params.id;
  const {name,type,date_from,date_to,price,status} = req.body;
  console.log(name,type,date_from,date_to,price,status);
  const modified = moment(new Date).format("MM/DD/YYYY, h:mm:ss");
  Sale.updateOne({ _id: saleID},  {
        name:name,
        type:type,
        date_from:date_from,
        date_to:date_to,
        salePrice:price,
        status:status
      },
      function (error, success) {
        res.redirect('/adminRestaurant/sale');
      });
});




module.exports = router;
