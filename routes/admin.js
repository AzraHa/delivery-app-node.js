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
const Food = require("../models/Food");
const RestaurantType = require("../models/RestaurantType");
const Admin = require("../models/Admin");
const bcrypt = require('bcryptjs');
/* Linkovi za mape
* https://developers.google.com/maps/documentation/javascript/examples/places-autocomplete-addressform#maps_places_autocomplete_addressform-javascript
* https://developers.google.com/maps/documentation/javascript/examples/directions-travel-modes
* https://developers.google.com/maps/documentation/javascript/examples/directions-complex*/
router.get('/dashboard',function (req,res,next) {
  /*Orders.find({}).select({"price"}).sort({"price" : -1}).limit(1).exec(function(err, doc){
      let max_price = doc[0].price;
    });*/
  TotalOrder.find({})
    .populate('restaurant').populate('customer').limit(4)
    .exec(function (err, doc) {
      Supplier.find({})
        .populate('restaurant').populate('customer').limit(4)
        .exec(function (err, supplier) {
          Restaurant.find({status: true}).limit(4). exec(function (err, Restaurant) {
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

router.delete('/suppliers/delete/:id',function(req,res,next){
  const supplierID = req.params.id;
  Supplier.deleteOne({ _id: supplierID }, function (err) {
    if (err) return err;
    else res.sendStatus(200);
  });
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
  const {name,email,address} = req.body;
  const modified = moment(new Date).format("MM/DD/YYYY, h:mm:ss");
  console.log(AdminID,name,email,modified,address);
    RestaurantAdmin.updateOne({ _id: AdminID},  {
      modified:modified,
      name:name,
      email:email,
      address:address
      },
      function (error, success) {
          res.redirect('/admin/admins');
    });
});
router.delete('/admins/delete/:id',function (req,res,next){
  const AdminID = req.params.id;
  RestaurantAdmin.deleteOne({ _id: AdminID }, function (err) {
    if (err) return err;
    else res.sendStatus(200);
  });

});
router.get('/suppliers',adminController.find_suppliers);

router.get('/user',function (req,res,next){
  res.send(req.user);
})
router.get('/food',function (req,res,next){
  Food.find({},function(err,food){
    res.render('admin/food',{
      user:req.user,
      food:food
    })
  });
});
router.get('/food/:id',function (req,res,next){
  Food.find({_id:req.params.id}).populate('type').populate('restaurant').exec(function(err,food){
    FoodType.find({},function(err,FoodTypeArray){
      Restaurant.find({},function(err,restaurants){
        res.render('admin/foodedit',{
          user:req.user,
          food:food,
          FoodTypeArray:FoodTypeArray,
          restaurants:restaurants
        })
      })
    })
  });
});
router.post('/food/:id',upload.single('picture'),function (req,res,next) {
  const {name, type, price, restaurant, picture} = req.body;
  //const image = req.file.filename;
  const modified = moment(new Date).format("MM/DD/YYYY, h:mm:ss");
  //console.log("name: " + name + " type: " + type + " price: " + price + " restaurant: " + restaurant + " picture " );
  if (!req.file) {
    Food.updateOne({_id: req.params.id},
      {
        name: name,
        type: type,
        price: price,
        restaurant: restaurant,
        modified: modified,
      },
      function (error, success) {
        res.redirect('/admin/food');
      });
  }else{
    Food.updateOne({_id: req.params.id},
      {
        name: name,
        type: type,
        price: price,
        restaurant: restaurant,
        modified: modified,
        picture:req.file.filename
      },
      function (error, success) {
        res.redirect('/admin/food');
      });
  }

});

router.delete('/food/delete/:id',function(req,res,next){
   Food.deleteOne({ _id: req.params.id }, function (err) {
      if (err) return err;
      else res.sendStatus(200);
    });
});

router.get('/add-restaurant',function (req,res,next){
  res.render('admin/add-restaurant',{user:req.user});
});

router.post('/add-restaurant',upload.single('picture'),function (req,res,next){

  const {name, email, address,koordinate,distance} = req.body;
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
        address,
        distance
      });
    } else {
      const newRestaurant = new Restaurant({
        name, email, address,email,image,status,koordinate,distance
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
  const {name, restaurantName,email,address,koordinate} = req.body;
  const status = true;
  const comm = new Supplier({
        name:name,
        email:email,
        s_address:address,
        koordinate:koordinate,
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
  const {name,email,address,restaurant,koordinate} = req.body;
  const supplierID = req.params.id;
  const modified = moment(new Date).format("MM/DD/YYYY, h:mm:ss");
  if(typeof restaurant === 'undefined') {
    Supplier.findOneAndUpdate({_id: supplierID}, {
      name:name,
      modified: modified,
      email: email,
      koordinate:koordinate,
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
          _id: restaurant
        },
      },
      name:name,
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
    //console.log(doc);
  });
  Restaurant.findOneAndUpdate({_id: restaurantID}, { $push: {
      suppliers: {
        _id : supplierID
      },
    }  }, {new: true}, (err, doc) => {
    if (err) {
      console.log("Something wrong when updating data!");
    }
    //console.log(doc);
  });
  res.redirect('/admin/suppliers');

});
router.get('/restaurants/:id',function(req,res,next){
  const rest_id = req.params.id;
  Restaurant.find({ _id: rest_id})
      .populate('suppliers')
      .exec(function(err, rest) {
        //console.log(rest);
        if (err) console.log(err);
        Supplier.find({restaurant:rest_id},function (err,supplier){
          if (err)
            return done(err);
          if (supplier) {
           // console.log(supplier);
            res.render('admin/restaurant', {
              user: req.user,
              supplier: supplier,
              restaurant:rest
            });
          }
        });
      });
});
router.post('/restaurants/:id',upload.single('picture'),function(req,res,next){
  const {address,email,type} = req.body;
  const modified = moment(new Date).format("MM/DD/YYYY, h:mm:ss");
  if(req.file){
    Restaurant.findOneAndUpdate({_id: req.params.id}, {
      image:req.file.filename,
      modified: modified,
      email: email,
      address: address,
      type:type
    }, (err, sucess) => {
      if (err) {
        console.log("Something wrong when updating data! " + err);
      }
      if (sucess) {
        console.log("Updated" + sucess);
      }
      res.redirect('/admin/restaurants');
    });
  }else {
    Restaurant.findOneAndUpdate({_id: req.params.id}, {
      modified: modified,
      email: email,
      address: address,
      type: type
    }, (err, sucess) => {
      if (err) {
        console.log("Something wrong when updating data! " + err);
      }
      if (sucess) {
        console.log("Updated" + sucess);
      }
      res.redirect('/admin/restaurants');
    });
  }
});

router.get('/orders',function (req,res,next) {
  TotalOrder.find({})
    .populate('restaurant').populate('customer').populate('supplier')
    .exec(function (err, doc) {
      res.render('admin/orders', {
        user: req.user,
        order: doc
      });
    })
});
router.get('/order/:id',function (req,res,next) {
  let orderID = req.params.id;
  TotalOrder.find({_id:orderID})
    .populate('restaurant').populate('customer').populate('supplier').populate('order')
    .exec(function (err, doc) {
      console.log(doc);
      res.render('admin/order', {
        user: req.user,
        order: doc
      });
    })
});
router.get('/profile',function (req,res,next){
  Admin.findOne({_id:req.user._id},function(err,admin){
    res.render('admin/profile',{
      user:req.user,
      admin:admin
    });
  });
});
router.post('/profile',upload.single('picture'),async function (req,res,next){
    let {name, address, email, password,adminID} = req.body;
    let newPassword;
    const modified = moment(new Date).format("MM/DD/YYYY, h:mm:ss");
    if (!req.file && password === "") {
      Admin.updateOne({_id: adminID},
        {
          name: name,
          address: address,
          email: email,
          date: modified,
        },
        function (error, success) {
        if(error) console.log("Error "+error.message);
          res.redirect('/admin/profile');
        });
    }else if(!req.file && password!== ""){
      bcrypt.genSalt(10, function (saltError, salt) {
        if (saltError) {
          throw saltError
        } else {
          bcrypt.hash(password, salt, function (hashError, hash) {
            if (hashError) {
              throw hashError
            } else {
              newPassword = hash;
              Admin.updateOne({_id: adminID},
                {
                  name: name,
                  address: address,
                  email: email,
                  date: modified,
                  password:newPassword
                },
                function (error, success) {
                  res.redirect('/admin/profile');
                });
            }
          })
        }
      });
    }
    else if(req.file && password === ""){
      console.log("slika"+req.file.filename)
      Admin.updateOne({_id: adminID},
        {
          picture:req.file.filename,
          name: name,
          address: address,
          email: email,
          date: modified
        },
        function (error, success) {
          res.redirect('/admin/profile');
        });
    }
    else if(req.file && password !== ""){
      bcrypt.genSalt(10, function (saltError, salt) {
        if (saltError) {
          throw saltError
        } else {
          bcrypt.hash(password, salt, function (hashError, hash) {
            if (hashError) {
              throw hashError
            } else {
              newPassword = hash;
              Admin.updateOne({_id: adminID},
                {
                  picture: req.file.filename,
                  name: name,
                  address: address,
                  email: email,
                  date: modified,
                  password:newPassword,
                },
                function (error, success) {
                  if(error)console.log("error"+error+error.message);
                  if(success)console.log("success: " +success)
                  res.redirect('/admin/profile');
                });
            }
          })
        }
      });
    }
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
router.get('/foodType',function (req,res,next){
  FoodType.find({},function (err,type){
    res.render('admin/foodType',{
      user:req.user,
      types:type
    });
  });
});
router.delete('/foodType/:id',function (req,res,next){
  const foodTypeID = req.params.id;
  FoodType.deleteOne({ _id: foodTypeID }, function (err) {
    if (err) return err;
    else res.sendStatus(200);
  });
});
router.post('/add-food-type',function (req,res,next){
  const name = req.body.name;
  const status = true;
  const comm = new FoodType({
    name:name,
    status:status
  });
  comm.save();
  comm.save();
  //console.log(comm);
  res.redirect('/admin/dashboard');
});
router.get('/add-restaurant-type',function (req,res,next){
  res.render('admin/addRestaurantType',{
    user:req.user
  });
});
router.post('/add-restaurant-type',function (req,res,next){
  const name = req.body.name;
  const status = true;
  const comm = new RestaurantType({
    name:name,
    status:status
  });
  comm.save();
  res.redirect('/admin/dashboard');
});
router.get('/restaurantType',function (req,res,next){
  RestaurantType.find({},function (err,rType){
    res.render('admin/restaurantType', {
      user:req.user,
      rType:rType
      });
  });
});
router.delete('/restaurantType/:id',function (req,res,next){
  const RestaurantTypeID = req.params.id;
  RestaurantType.deleteOne({ _id: RestaurantTypeID }, function (err) {
    if (err) return err;
    else res.sendStatus(200);
  });
});
module.exports = router;
