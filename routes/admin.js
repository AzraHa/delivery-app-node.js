const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');
const Supplier = require('../models/Supplier');
const upload = require('../controllers/uploadController');
const RestaurantAdmin = require("../models/RestaurantAdmin");
const moment = require('moment');
const User = require("../models/User"); // require
const FoodType = require('../models/FoodType');
const passport = require('passport');
const jwt = require("jsonwebtoken");
const TotalOrder = require("../models/TotalOrder");
const Food = require("../models/Food");
const Admin = require("../models/Admin");
const bcrypt = require('bcryptjs');
const RestaurantType = require("../models/RestaurantType");

const {isAuthenticatedSuperAdmin} = require('../config/auth');

router.get('/login',function(req,res,next){
  res.render('admin/login');
});

router.post('/login',function(req,res,next){
  passport.authenticate('administrator', {
    successRedirect: '/admin/dashboard',
    failureRedirect: '/admin/login',
    failureFlash: true
  })(req, res, next);
});

router.get('/logout',function(req,res,next){
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/admin/login');
});

router.get('/dashboard',isAuthenticatedSuperAdmin,function (req,res,next) {
  TotalOrder.find({}).populate('restaurant').populate('customer').populate('supplier').limit(4)
    .exec(function (err, doc) {
      if(err) return err;
      Supplier.find({}).populate('restaurant').populate('customer').limit(4).exec(function (err, supplier) {
        if(err) return err;
        Restaurant.find({status: true}).limit(4). exec(function (err, Restaurant) {
          if(err) return err;
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

router.get('/customers/:status',isAuthenticatedSuperAdmin,function (req,res,next){
  const st = req.params.status;
  let status = true;
  if(st==="false") status = false;
  User.find({status:status}, function(err, Users){
    if (err)
      return done(err);
    if (Users) {
      res.render('admin/users', {
        user: req.user,
        usersArray: Users,
        stat: status
      });
    }
  });
});

router.get('/add-restaurant-admin',isAuthenticatedSuperAdmin,function(req,res,next){
  Restaurant.find({}).exec(function(err, restaurant) {
      if (err) console.log(err);
      res.render('admin/add-restaurant-admin', {
        user: req.user,
        restaurantsArray: restaurant
      });
    });
});

router.post('/add-restaurant-admin',isAuthenticatedSuperAdmin,function(req,res,next){
  const {restaurantName, adminName, address, koordinate , adminEmail, password} = req.body;
  const status = true;
  let errors = [];
  if (!adminName || !adminEmail || !password || !address ) {
    errors.push({msg: 'Please enter all fields'});
  }
  if (errors.length > 0) {
    res.render('admin/add-restaurant-admin', {
      errors,
      adminName,
      adminEmail
    });
  }else {
    RestaurantAdmin.findOne({ email: adminEmail }).then(user => {
      if (user) {
        errors.push({ msg: 'Email already exists' });
        res.render('admin/add-restaurant-admin', {
          errors,
          adminName,
          adminEmail,
          user
        });
      } else {
        const newUser = new RestaurantAdmin({
          name: adminName,
          email: adminEmail,
          password: password,
          restaurant : restaurantName,
          address: address,
          koordinate:koordinate,
          status: status
        });
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                res.redirect('/admin/dashboard');
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
});

router.get('/customers/active/:id',isAuthenticatedSuperAdmin,function (req,res,next) {
  User.find({_id: req.params.id,status:true}, function(err, user){
    if(err) return err;
    res.render('admin/user', {
      user: req.user,
      userArray: user,
    });
  });
});

router.get('/admins',isAuthenticatedSuperAdmin,function(req,res,next){
  RestaurantAdmin.find({status:true}).populate('restaurant').exec(function(err, resAdmin) {
    if (err) console.log(err);
      res.render('admin/admin-restaurant', {
        user: req.user,
        resAdminArray: resAdmin
      });
    });
});

router.delete('/suppliers/delete/:id',isAuthenticatedSuperAdmin,function(req,res,next){
  const supplierID = req.params.id;
  Restaurant.updateMany({},{$pull : {suppliers : supplierID}},{new:true}, function (err) {
    if (err) return err;
    else {
      Supplier.deleteOne({_id: req.params.id}, function (err) {
        if (err) return res.send(err);
        res.sendStatus(200);
      });
    }
  });
});


router.get('/admins/:id',isAuthenticatedSuperAdmin,function (req,res,next){
  const adminID = req.params.id;
  RestaurantAdmin.find({_id:adminID}).populate('restaurant').exec(function(err, resAdmin) {
      if (err) console.log(err);
      Restaurant.find({status: true}, function (err, restaurant) {
        if(err) return err;
        res.render('admin/RestaurantAdmin', {
            user: req.user,
            resAdminArray: resAdmin,
            restaurant: restaurant
          });
      });
  });
});

router.post('/admins/:id',isAuthenticatedSuperAdmin,upload.single('picture'),function (req,res,next) {
  const AdminID = req.params.id;
  const {name, email, address, koordinate} = req.body;
  const modified = moment().format("MM/DD/YYYY h:mm:ss");
  if (!req.file) {
    RestaurantAdmin.updateOne({_id: AdminID},
        {
          modified: modified,
          name: name,
          email: email,
          address: address,
          koordinate: koordinate
        },
        function (error,success) {
          if (error) return error;
          else res.redirect('/admin/admins');
        });
  } else {
    RestaurantAdmin.updateOne({_id: req.params.id},
        {
          modified: modified,
          name: name,
          email: email,
          address: address,
          koordinate: koordinate,
          picture:req.file.filename
        },
        function (error,success) {
          if (error) return error;
          else res.redirect('/admin/admins');
        });
  }
});

router.delete('/admins/delete/:id',isAuthenticatedSuperAdmin,function (req,res,next){
  const AdminID = req.params.id;
  RestaurantAdmin.deleteOne({ _id: AdminID }, function (err) {
    if (err) return err;
    else res.sendStatus(200);
  });
});

router.get('/suppliers',isAuthenticatedSuperAdmin,function(req,res,next){
  Supplier.find({}).populate('restaurant').exec(function(err, person) {
      if (err) console.log(err);
      res.render('admin/suppliers', {
        user: req.user,
        suppliers: person
      });
    });
});

router.get('/food',isAuthenticatedSuperAdmin,function (req,res,next){
  Food.find({}).populate('type').populate('restaurant').exec(function(err,food){
    if(err) return err;
    res.render('admin/food',{
      user:req.user,
      food:food
    })
  });
});

router.get('/food/:id',isAuthenticatedSuperAdmin,function (req,res,next){
  Food.find({_id:req.params.id}).populate('type').populate('restaurant').exec(function(err,food){
    if(err) return err;
    FoodType.find({},function(err,FoodTypeArray){
      if(err) return err;
      Restaurant.find({},function(err,restaurants){
        if(err) return err;
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

router.post('/food/:id',isAuthenticatedSuperAdmin,upload.single('picture'),function (req,res,next) {
  const {name, type, price} = req.body;
  const modified = moment(new Date).format("MM/DD/YYYY, h:mm:ss");
  if (!req.file) {
    Food.updateOne({_id: req.params.id},
      {
        name: name,
        type: type,
        price: price,
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
        modified: modified,
        picture:req.file.filename
      },
      function (error, success) {
        res.redirect('/admin/food');
      });
  }
});

router.delete('/food/delete/:id',isAuthenticatedSuperAdmin,function(req,res,next){
   Food.deleteOne({ _id: req.params.id }, function (err) {
      if (err) return err;
      else res.sendStatus(200);
    });
});
router.delete('/restaurant/delete/:id',isAuthenticatedSuperAdmin,function(req,res,next){
  Restaurant.deleteOne({ _id: req.params.id }, function (err) {
      if (err) return err;
      else {
          Food.deleteMany({restaurant: req.params.id}, function (err, res) {
              if (err) return err;
          });
          RestaurantAdmin.deleteOne({restaurant:req.params.id},function (err,admin){
              if(err) return err;
          })
        res.sendStatus(200);
      }
  });
});

router.get('/add-restaurant',isAuthenticatedSuperAdmin,function (req,res,next){
  RestaurantType.find({},function(err,tip){
    if(err) return err;
    res.render('admin/add-restaurant',{user:req.user,tip:tip});
  })
});

router.post('/add-restaurant',isAuthenticatedSuperAdmin,upload.single('picture'),function (req,res,next){
  const {name, email, address,koordinate,tip,distance} = req.body;
  let errors = [];
  const status = true;
  if (!name || !email || !address || !tip || !distance ) {
    errors.push({msg: 'Please enter all fields'});
  }
  if (errors.length > 0) {
    res.render('admin/add-restaurant', {
      errors,
      name,
      email,
      address,
      distance,
      user:req.user
    });
  }else {
    if (!req.file) {
      Restaurant.findOne({name: name, email: email}).then(rest => {
        if (rest) {
          errors.push({msg: 'Restaurant already exists'});
          res.render('admin/add-restaurant', {
            errors,
            name,
            email,
            address,
            distance,
            user:req.user
          });
        } else {
          const newRestaurant = new Restaurant({
            name, email, address, status, koordinate,tip
          });
          newRestaurant.save().then(user => {
              res.redirect('/admin/restaurants');
          })
        }
      });
    } else {
      Restaurant.findOne({name: name, email: email}).then(resta => {
        if (resta) {
          errors.push({msg: 'Restaurant already exists'});
          res.render('admin/add-restaurant', {
            errors,
            name,
            email,
            address,
            distance,
            user:req.user
          });
        } else {
          const newRestaurant = new Restaurant({
            name, email, address, status, image: req.file.filename, koordinate, distance,tip
          });
          newRestaurant.save().then(user => {
              res.redirect('/admin/restaurants');
          })
        }
      });
    }
  }
});

router.get('/restaurants',isAuthenticatedSuperAdmin,function (req,res,next){
  Restaurant.find({status:true},function (err,Restaurant){
    if (err)
      return done(err);
    if (Restaurant) {
      res.render('admin/restaurants', {
        user: req.user,
        RestaurantArray: Restaurant
      });
    }
  });
});

router.get('/add-suppliers',isAuthenticatedSuperAdmin,function (req,res,next){
  Restaurant.find({status:true},function (err,restaurant){
    if (err)
      return done(err);
    if (restaurant) {
      res.render('admin/add-suppliers', {
        user: req.user,
        restaurantArray: restaurant
      });
    }
  });
});

router.post('/add-suppliers',isAuthenticatedSuperAdmin,function (req,res,next){
  const {name, restaurantName,email,address,koordinate,password} = req.body;
  const status = 1;
  let errors = [];
  if (!name || !email || !address ) {
    errors.push({msg: 'Please enter all fields'});
  }
  if (errors.length > 0) {
    res.render('admin/add-suppliers', {
      errors,
      name,
      email,
      address,
      user:req.user
    });
  }else{
    Supplier.findOne({ email: email }).then(user => {
      if (user) {
        errors.push({ msg: 'Email already exists' });
        res.render('admin/add-suppliers', {
          errors,
          name,
          email,
          user:req.user
        });
      } else {
        const newUser =new Supplier({
          name:name,
          email:email,
          s_address:address,
          koordinate:koordinate,
          password:password,
          restaurant:restaurantName,
          status:status
        });
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser.save().then(user => {
              Restaurant.updateOne({ _id: restaurantName}, {
                  $push: {
                    suppliers: {
                      _id : newUser._id
                    }
                  }},
                function (error, success) {
                  res.redirect('/admin/suppliers');
                });
            })
          });
        });
      }
    });
  }

});

router.get('/suppliers/:id',isAuthenticatedSuperAdmin,function(req,res,next){
  const supp_id = req.params.id;
  Supplier.find({ _id: supp_id}).populate('restaurant').exec(function(err, supplier) {
      if (err) console.log(err);
      Restaurant.find({status:true},function (err,restaurant){
        if (err)
          return done(err);
        if (restaurant) {
          res.render('admin/supplier', {
            user: req.user,
            supplier: supplier,
            restaurantArray:restaurant
          });
        }
      });
    });
});

router.post('/suppliers/:id',isAuthenticatedSuperAdmin,function(req,res,next){
  const {name,email,address,restaurant,koordinate} = req.body;
  const supplierID = req.params.id;
  const modified = moment().format("MM/DD/YYYY h:mm:ss");
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
      s_address: address,
      koordinate:koordinate
    }, {new: true}, (err, doc) => {
      if (err) {
        console.log("Something wrong when updating data! " + err);
      }else{
        Restaurant.findOneAndUpdate({_id:restaurant},{$push:{suppliers:supplierID}},{new:true},function(err,res){
          if(err) return err;
        })
        res.redirect('/admin/suppliers');
      }
    });
  }
});
router.post('/suppliers/remove/:id/:restoran',function(req,res,next){
  Restaurant.findOneAndUpdate({_id: req.params.restoran},
      {$pull: { suppliers: req.params.id}},{new:true},
      function(err) {
        if (err) {
          res.send(err);
          return;
        }
        Supplier.findOneAndUpdate({_id: req.params.id},
            {
              $pull: { restaurant: req.params.restoran }},{new:true},
            function(err) {
                if(err) return res.send(err);
                res.sendStatus(200);
            });
      });
});

router.get('/restaurants/:id',isAuthenticatedSuperAdmin,function(req,res,next){
  const rest_id = req.params.id;
  Restaurant.find({ _id: rest_id}).populate('suppliers').populate('tip').exec(function(err, rest) {
      if (err) console.log(err);
      Supplier.find({restaurant:rest_id},function (err,supplier){
          if (err)
            return done(err);
          if (supplier) {
            RestaurantType.find({},function(err,tip){
                res.render('admin/restaurant', {
                user: req.user,
                supplier: supplier,
                restaurant:rest,
                tip:tip
              });
            })
          }
      });
  });
});


router.post('/restaurants/:id',isAuthenticatedSuperAdmin,upload.single('picture'),function(req,res,next){
  const {address,email,tip,koordinate} = req.body;
  const modified = moment().format("MM/DD/YYYY h:mm:ss");
  if(req.file){
    Restaurant.findOneAndUpdate({_id: req.params.id}, {
      image:req.file.filename,
      modified: modified,
      email: email,
      address: address,
      tip:tip,
      koordinate:koordinate
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
      tip: tip,
      koordinate:koordinate

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

router.get('/orders',isAuthenticatedSuperAdmin,function (req,res,next) {
  TotalOrder.find({}).populate('restaurant').populate('customer').populate('supplier').exec(function (err, doc) {
    if(err) return err;
    res.render('admin/orders', {
        user: req.user,
        order: doc
      });
    })
});

router.get('/order/:id',isAuthenticatedSuperAdmin,function (req,res,next) {
  let orderID = req.params.id;
  TotalOrder.find({_id:orderID}).populate([{
    path: 'orders',
    populate: {
      path: 'food',
      model: 'Food'
    }
  }]).populate('restaurant').populate('customer').populate('supplier').exec(function (err, doc) {
      if(err) return err;
      res.render('admin/order', {
        user: req.user,
        order: doc
      });
    })
});

router.get('/profile',isAuthenticatedSuperAdmin,function (req,res,next){
  Admin.findOne({_id:req.user._id},function(err,admin){
    if(err) return err;
    res.render('admin/profile',{
      user:req.user,
      admin:admin
    });
  });
});

router.post('/profile',isAuthenticatedSuperAdmin,upload.single('picture'),async function (req,res,next){
    let {name, address, email, password,adminID,koordinate} = req.body;
    let newPassword;
    const modified = moment().format("MM/DD/YYYY h:mm:ss");
    if (!req.file && password === "") {
      Admin.updateOne({_id: adminID},
        {
          name: name,
          address: address,
          email: email,
          date: modified,
          koordinate:koordinate
        },
        function (err) {
          if(err) return err;
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
                  password:newPassword,
                  koordinate:koordinate
                },
                function (error, success) {
                  if(error)console.log("error"+error.message);
                  if(success)console.log("success: " +success);
                  res.redirect('/admin/profile');
                });
            }
          })
        }
      });
    }
    else if(req.file && password === ""){
      Admin.updateOne({_id: adminID},
        {
          picture:req.file.filename,
          name: name,
          address: address,
          email: email,
          date: modified,
          koordinate:koordinate
        },
        function (error, success) {
          if(error)console.log("error"+error.message);
          if(success)console.log("success: " +success);
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
                  koordinate:koordinate
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


router.get('/add-food-type',isAuthenticatedSuperAdmin,function (req,res,next){
  res.render('admin/add-food-type',{user:req.user});
});

router.get('/foodType',isAuthenticatedSuperAdmin,function (req,res,next){
  FoodType.find({},function (err,type){
    if(err) console.log("Error " + err.message);
    res.render('admin/foodType',{
      user:req.user,
      types:type
    });
  });
});
router.get('/foodType/:id',isAuthenticatedSuperAdmin,function (req,res,next){
  const foodType = req.params.id;
  Food.find({type:foodType}).populate('restaurant').populate('type').exec(function(err,food){
    if(err) console.log("Error " + err.message);
    res.render('admin/typeFood',{
      user:req.user,
      food:food
    })
  })
});

router.delete('/foodType/:id',isAuthenticatedSuperAdmin,function (req,res,next){
  const foodTypeID = req.params.id;
  FoodType.deleteOne({ _id: foodTypeID }, function (err) {
    if (err) return err;
    else res.sendStatus(200);
  });
});
router.delete('/restaurantType/:id',isAuthenticatedSuperAdmin,function (req,res,next){
  const restaurantType = req.params.id;
  RestaurantType.deleteOne({ _id: restaurantType }, function (err) {
    if (err) {
      return err;
    }
    else {
      Restaurant.updateMany({tip:restaurantType}, {$unset: {tip: 1 }},function(err){
        if(err) return err;
        else{
          res.sendStatus(200);
        }
      });
    }
  });
});

router.post('/add-food-type',isAuthenticatedSuperAdmin,function (req,res,next){
  const name = req.body.name;
  const status = true;
  const newFoodType =  new FoodType({
    name:name,
    status:status
  });
  newFoodType.save().then(user => {res.redirect('/admin/foodType');}).catch(err => console.log(err));
});

router.get('/restaurantType',isAuthenticatedSuperAdmin,function(req,res,next){
  RestaurantType.find({},function (err,type){
    Restaurant.find({}).populate('tip').exec(function(err,restaurants){
      if(err) console.log("Error " + err.message);
      res.render('admin/restaurantType',{
        user:req.user,
        types:type,
        restaurants:restaurants
      });
    })
  });
});
router.get('/add-restaurantType',isAuthenticatedSuperAdmin,function(req,res,next){
    res.render('admin/add-restaurantType',{
      user:req.user
  });
});
router.post('/add-restaurantType',isAuthenticatedSuperAdmin,function(req,res,next){
  const newRestaurantType =  new RestaurantType({
    name:req.body.name,
    status:true
  });
  newRestaurantType.save().then(user => {res.redirect('/admin/restaurantType');}).catch(err => console.log(err));
});


module.exports = router;
