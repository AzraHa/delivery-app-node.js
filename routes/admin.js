const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminControllers');
const Restaurant = require('../models/Restaurant');
const Supplier = require('../models/Supplier');
const upload = require('../controllers/uploadController');
const RestaurantAdmin = require("../models/RestaurantAdmin");
const moment = require('moment');
const User = require("../models/User"); // require
const FoodType = require('../models/FoodType');
const passport = require('passport');
const jwt = require("jsonwebtoken");
const Order = require("../models/Order");
const TotalOrder = require("../models/TotalOrder");
/* Linkovi za mape
* https://developers.google.com/maps/documentation/javascript/examples/places-autocomplete-addressform#maps_places_autocomplete_addressform-javascript
* https://developers.google.com/maps/documentation/javascript/examples/directions-travel-modes
* https://developers.google.com/maps/documentation/javascript/examples/directions-complex*/
router.get('/dashboard',function (req,res,next) {
  /*Orders.find({}).select({"price"}).sort({"price" : -1}).limit(1).exec(function(err, doc){
      let max_price = doc[0].price;
    });*/
  TotalOrder.find({})//sve restorane sa suppliers
    .populate('restaurant').populate('customer')
    .exec(function (err, doc) {
      Supplier.find({})//sve restorane sa suppliers
        .populate('restaurant').populate('customer')
        .exec(function (err, supplier) {
          Restaurant.find({status: true}, function (err, Restaurant) {
            res.render('admin/dashboard', {
              user: req.user,
              order: doc,
              suppliersArray: supplier,
              RestaurantArray: Restaurant
            });
          });
        });
    });
});
router.get('/login',adminController.admin_login_get);

const maxAge = 3 *24 *60 *60 ;
const createToken = (id) => {
  return jwt.sign({id},'strasno',{
    expiresIn: maxAge
  });
}
router.post('/login',
    passport.authenticate('administrator',{
      failureRedirect: '/admin/login',
      failureFlash: true
    }),
    function(req, res) {
      // If this function gets called, authentication was successful.
      // `req.user` contains the authenticated user.
      res.cookie('jwt', createToken(req.user._id), { httpOnly: true, maxAge: 5555 * 1000 });
      res.redirect('/admin/dashboard');
    });

router.get('/register',adminController.admin_register_get);

router.post('/register',adminController.admin_register_post);

router.post('/login',adminController.admin_login_post);

router.get('/logout',adminController.admin_logout);

router.get('/customers/:status',adminController.find_customers);

router.get('/delete-customers/:id', adminController.delete_customers);

router.get('/add-restaurant-admin',adminController.add_restaurant_admin_get);

router.post('/add-restaurant-admin',adminController.add_restaurant_admin_post);

router.get('/customers/active/:id',function (req,res,next) {
  User.find({_id: req.params.id,status:true}, function(err, user){
    if(err) res.json(err);
    else{
      res.render('admin/user', {
        user: req.user,
        userArray: user,
      });
    }
  });
});

router.get('/admins',adminController.find_restaurant_admin);

router.get('/suppliers/delete/:id',function(req,res,next){
    Supplier.findByIdAndRemove(req.params.id, function (err, post) {
      if (err) return next(err);

    });
    res.redirect('/admin/suppliers');
});
router.get('/admins/:id',function (req,res,next){
  const adminID = req.params.id;
  RestaurantAdmin.find({_id:adminID})
      .populate('restaurant')
      .exec(function(err, resAdmin) {
        console.log(resAdmin);
        if (err) console.log(err);
        Restaurant.find({status: true}, function (err, restaurant) {
          res.render('admin/RestaurantAdmin', {
            user: req.user,
            resAdminArray: resAdmin,
            restaurant: restaurant
          });
        });
      });
});
router.post('/admins/:id',function (req,res,next){
  const AdminID = req.params.id;
  const restaurantName = req.body.restaurantName;
  const adminStatus = req.body.adminStatus;
  const modified = moment(new Date).format("MM/DD/YYYY, h:mm:ss");
  console.log(AdminID,restaurantName,adminStatus,modified);
  if (typeof restaurantName !== 'undefined' && typeof adminStatus !== 'undefined'){
    RestaurantAdmin.updateOne({ _id: AdminID},  { status: adminStatus ,restaurant:restaurantName,modified:modified },
        function (error, success) {
          res.redirect('/admin/admins');
        });
  }
  if (typeof restaurantName !== 'undefined' && typeof adminStatus === 'undefined'){
    RestaurantAdmin.updateOne({ _id: AdminID},  { restaurant:restaurantName,modified:modified },
        function (error, success) {
          res.redirect('/admin/admins');
        });
  }
  if (typeof restaurantName === 'undefined' && typeof adminStatus !== 'undefined'){
    RestaurantAdmin.updateOne({ _id: AdminID},  { status:adminStatus,modified:modified },
        function (error, success) {
          res.redirect('/admin/admins');
        });
  }

});
router.get('/suppliers',adminController.find_suppliers);

router.get('/user',function (req,res,next){
  res.send(req.user);
})

router.get('/add-restaurant',function (req,res,next){
  res.render('admin/add-restaurant',{user:req.user});
});

router.post('/add-restaurant',upload.single('picture'),function (req,res,next){

  const {name, email, address,koordinate} = req.body;
  const image = req.file.filename;
  console.log('photo '+image);
  let errors = [];
  const status = true;
  Restaurant.findOne({ name: name,email:email }).then(resAdmin => {
    if (resAdmin) {
      errors.push({ msg: 'Restaurant already exists' });
      res.render('admin/add-restaurant', {
        errors,
        name,
        email,
        address
      });
    } else {
      const newRestaurant = new Restaurant({
        name, email, address,email,image,status,koordinate
      });
      console.log(newRestaurant);
      newRestaurant
        .save()
        .then(user =>{
          res.redirect('/admin/dashboard');
        })
    }
  });
});

router.get('/restaurants',function (req,res,next){
  Restaurant.find({status:true},function (err,Restaurant){
    if (err)
      return done(err);

    if (Restaurant) {
      console.log(Restaurant);
      res.render('admin/restaurants', {
        user: req.user,
        RestaurantArray: Restaurant
      });
    }
  });
});
router.get('/add-suppliers',function (req,res,next){
  Restaurant.find({status:true},function (err,restaurant){
    if (err)
      return done(err);
    if (restaurant) {
      console.log(restaurant);
      res.render('admin/add-suppliers', {
        user: req.user,
        restaurantArray: restaurant
      });
    }
  });
});
router.post('/add-suppliers',function (req,res,next){
  const {name, restaurantName,email,address} = req.body;
  const status = true;
  const comm = new Supplier({
        name:name,
        email:email,
        s_address:address,
        restaurant:restaurantName,
        status:status
  });
  comm.save();
  Restaurant.updateOne({ _id: restaurantName}, { $push: {
      suppliers: {
        _id : comm._id
      }
    }  },
    function (error, success) {
      res.redirect('/admin/suppliers');
    });

});

router.get('/suppliers/:id',function(req,res,next){
  const supp_id = req.params.id;
  Supplier.find({ _id: supp_id})//sve restorane sa suppliers
    .populate('restaurant') // only works if we pushed refs to person.eventsAttended
    .exec(function(err, supplier) {
      console.log(supplier);
      if (err) console.log(err);
      Restaurant.find({status:true},function (err,restaurant){
        if (err)
          return done(err);
        if (restaurant) {
          console.log(restaurant);
          res.render('admin/supplier', {
            user: req.user,
            supplier: supplier,
            restaurantArray:restaurant
          });
        }
      });

    });
});
router.post('/suppliers/:id',function(req,res,next){
  const {restaurantID,email,address} = req.body;
  const supplierID = req.params.id;
  const modified = moment(new Date).format("MM/DD/YYYY, h:mm:ss");
  console.log(restaurantID,email,address,supplierID,modified);
  if(typeof restaurantID === 'undefined') {
    Supplier.findOneAndUpdate({_id: supplierID}, {
      modified: modified,
      email: email,
      s_address: address
    }, {new: true}, (err, doc) => {
      if (err) {
        console.log("Something wrong when updating data! " + err);
      }
      //console.log(doc);
      res.redirect('/admin/suppliers');
    });
  }else{
    Supplier.findOneAndUpdate({_id: supplierID}, {
      $push: {
        restaurant: {
          _id: restaurantID
        },
      },
      modified: modified,
      email: email,
      s_address: address
    }, {new: true}, (err, doc) => {
      if (err) {
        console.log("Something wrong when updating data! " + err);
      }
      //console.log(doc);
      res.redirect('/admin/suppliers');
    });
  }
});
router.post('/add-restaurant-suppliers',function(req,res,next){
  const restaurantID = req.body.restaurantID;
  const supplierID = req.body.supplierID;
  const supplierEmail = req.body.email;
  const supplierAddress = req.body.address;
  Supplier.findOneAndUpdate({_id: supplierID}, { email:supplierEmail,s_address:supplierAddress,
    $push: {
      restaurant: {
        _id : restaurantID
      }
    }  }, {new: true}, (err, doc) => {
    if (err) {
      console.log("Something wrong when updating data!");
    }
    console.log(doc);
  });
  Restaurant.findOneAndUpdate({_id: restaurantID}, { $push: {
      suppliers: {
        _id : supplierID
      },
    }  }, {new: true}, (err, doc) => {
    if (err) {
      console.log("Something wrong when updating data!");
    }
    console.log(doc);
  });
  res.redirect('/admin/suppliers');

});
router.get('/restaurants/:id',function(req,res,next){
  const rest_id = req.params.id;
  Restaurant.find({ _id: rest_id})
      .populate('suppliers')
      .exec(function(err, rest) {
        console.log(rest);
        if (err) console.log(err);
        Supplier.find({status:true,restaurant:rest_id},function (err,supplier){
          if (err)
            return done(err);
          if (supplier) {
            console.log(supplier);
            res.render('admin/restaurant', {
              user: req.user,
              supplier: supplier,
              restaurant:rest
            });
          }
        });
      });
});

router.get('/orders',function (req,res,next) {
  TotalOrder.find({})//sve restorane sa suppliers
    .populate('restaurant').populate('customer')
    .exec(function (err, doc) {
      console.log(doc);
      res.render('admin/orders', {
        user: req.user,
        order: doc
      });
    })
});

router.get('/profile',function (req,res,next){
  res.render('admin/profile',{user:req.user});
});
router.post('/profile',function (req,res,next){

});

router.get('/mail',function (req,res,next){
  //nodemailer sa w3schools :)
  var nodemailer = require('nodemailer');

  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'nodeprojekat@gmail.com',
      pass: 'node1234'
    }
  });

  var mailOptions = {
    from: 'azrahadzihajdarevic28@gmail.com',
    to: 'azrychh@gmail.com',
    subject: 'Sending Email using Node.js',
    text: 'That was easy!'
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
});

router.get('/add-food-type',function (req,res,next){
  res.render('admin/add-food-type',{user:req.user});
});
router.post('/add-food-type',function (req,res,next){
  const name = req.body.name;
  const status = true;
  const comm = new FoodType({
    name:name,
    status:status
  });
  comm.save();
  console.log(comm);
  res.redirect('/admin/dashboard');
});

module.exports = router;
