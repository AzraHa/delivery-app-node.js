const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminControllers');
const Restaurant = require('../models/restourant');
const Supplier = require('../models/suppliers');
const upload = require('../controllers/uploadController');
const RestaurantAdmin = require("../models/RestaurantAdmin");
const moment = require('moment');
const User = require("../models/User"); // require

/* GET home page. */
router.get('/dashboard',function (req,res,next){
  /*Orders.find({}).select({"price"}).sort({"price" : -1}).limit(1).exec(function(err, doc){
      let max_price = doc[0].price;
    });*/
  Supplier.find({}).sort({"modified" : -1}).limit(5).exec(function(err, doc){
      let suppliers = doc;
      res.render('admin/dashboard', {
        user: req.user,
        suppliers:suppliers
      })
    });

});

router.get('/login',adminController.admin_login_get);

router.post('/login',adminController.admin_login_post);

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

  const {name, email, address} = req.body;
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
        name, email, address,email,image,status
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
  const {name, restaurantName,email,s_address} = req.body;
  const status = true;
  const comm = new Supplier({
        name:name,
        email:email,
        s_address:s_address,
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
router.post('/add-restaurant-suppliers',function(req,res,next){
  const restaurantID = req.body.restaurantID;
  const supplierID = req.body.supplierID;
  //console.log(restaurantID,supplierID);
  //console.log(typeof restaurantID,typeof supplierID);
  /*Supplier.updateOne({ _id: supplierID}, {
    $push: {
        restaurant: {
          _id :restaurantID
        }}
  });*/
  Supplier.findOneAndUpdate({_id: supplierID}, { $push: {
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

router.get('/orders',function (req,res,next){
  res.render('admin/orders',{user:req.user});
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

module.exports = router;
