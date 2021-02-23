const express = require('express');
const router = express.Router();
const Food = require('../models/Food');
const FoodType = require('../models/FoodType');
const Sale = require('../models/Sale');
const Restaurant = require("../models/Restaurant");
const Order = require("../models/Order");
const User = require("../models/User");
const TotalOrder = require("../models/TotalOrder");
const {ObjectId} = require("bson");
const moment = require('moment');
const Supplier = require("../models/Supplier");
const geolib = require("geolib");
const nodemailer = require('nodemailer');
const upload = require('../controllers/uploadController');
const passport = require('passport');
const jwt = require("jsonwebtoken");
const createToken = (id) => {
  return jwt.sign({id},'strasno',{
    expiresIn: maxAge
  });
}
//const {ensureAuthenticated} = require('../config/auth');

router.get('/login',function(req,res,next){
  res.render('user/login');
});
router.post('/login',function (req,res,next){
  passport.authenticate('userLocal', {
    successRedirect: '/users/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
  const maxAge = 3 *24 *60 *60 ;
  const createToken = (id) => {
    return jwt.sign({id},'strasno',{
      expiresIn: maxAge
    });
  }
  const token = createToken(User._id);
  res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
});

router.get('/register',function(req,res,next){
  res.render('user/register');
});
router.post('/register',function(req,res,next){
  const {name, email, password, password2, address,number,koordinate} = req.body;
  let errors = [];
  const status = true;
  if (!name || !email || !password || !password2 || !address || !number) {
    errors.push({msg: 'Please enter all fields'});
  }

  if (password !== password2) {
    errors.push({msg: 'Passwords do not match'});
  }

  if (password.length < 6) {
    errors.push({msg: 'Password must be at least 6 characters'});
  }

  if (errors.length > 0) {
    res.render('user/register', {
      errors,
      name,
      email,
      password,
      password2,
      address,
      number

    });
  }else {
    User.findOne({ email: email }).then(user => {
      if (user) {
        errors.push({ msg: 'Email already exists' });
        res.render('user/register', {
          errors,
          name,
          email,
          password,
          password2,
          address,
          number
        });
      } else {
        const newUser = new User({
          name,
          email,
          password,
          address,
          status,
          number,
          koordinate
        });
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                req.flash(
                  'success_msg',
                  'You are now registered and can log in'
                );
                res.redirect('/users/login');
              })
              .catch(err => console.log(err));
          });
        });
        console.log(newUser);
      }
    });
  }
});

router.get('/logout',function(req,res,next){
  res.cookie('jwt','',{maxAge: 1 });
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});

router.get('/dashboard',function(req,res,next){
  Food.find({}).populate('restaurant').sort({"modified" : -1}).limit(6).exec(function(err,food){
        FoodType.find().exec(function (err,foodtype){
            Restaurant.find({}).exec(function (err,allRestaurants){
              if(req.user){
                User.findOne({_id: req.user._id}, function (err, user) {
                  const adresa = user.koordinate.replace("(", "").replace(")", "");
                  const nova = adresa.split(",");
                  let userLatitude = parseFloat(nova[0]);
                  let userLongitude = parseFloat(nova[1]);
                  var restorani = [];
                  for(let k=0;k<allRestaurants.length;k++)
                  {
                    var restoranDostava = allRestaurants[k].distance;
                    const adresa = allRestaurants[k].koordinate.replace("(", "").replace(")", "");
                    const nova = adresa.split(",");
                    let restoranLatitude = parseFloat(nova[0]);
                    let restoranLongitude = parseFloat(nova[1]);
                    var udaljenost = geolib.getDistance({latitude: userLatitude, longitude: userLongitude},
                      {latitude: restoranLatitude, longitude: restoranLongitude}, accuracy = 1);
                    if(udaljenost<=restoranDostava){
                      restorani.push(allRestaurants[k]);
                    }
                  }
                  Order.find({'customer': req.user._id, status: 1}).populate('food').populate('restaurant').exec(function (err, order) {
                    res.render('user/dashboard', {
                      user: req.user,
                      food: food,
                      foodtype: foodtype,
                      restaurant: restorani,
                      restoran: JSON.stringify(allRestaurants),
                      order_len: order.length,
                    });
                  });
                })
              }else {
                    res.render('user/dashboard', {
                      user:req.user,
                      food: food,
                      foodtype: foodtype,
                      restoran: JSON.stringify(allRestaurants),
                      restaurant: allRestaurants
                    });
              }
            })
        })
    });
});

router.get('/getOrder',function(req,res,next){
  Order.find({'customer': req.user._id, status: 1}).exec(function (err, order) {
    let orderlen = order.length;
    res.send({
      orderLen: orderlen
    });
  });
});

router.post('/search',function(req,res,next){
  Food.find({name:req.body.nazivArtikla},function(err,food){
    if(typeof food === "undefined" || food.length<1){
      FoodType.find({name:req.body.nazivArtikla},function(err,types){
        Food.find({type:types[0]._id}).populate('restaurant').exec(function(err,food){
          console.log(food)
          res.render('search', {
            user: req.user,
            food: food,
            tip:req.body.nazivArtikla
          });
        });
      })
    }else{
      console.log(food)
      res.render('user/search', {
        user: req.user,
        food: food,
        tip:req.body.nazivArtikla
      });
    }
  });
});

router.get('/sale',function (req,res,next){
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1;
  var yyyy = today.getFullYear();
  if(dd<10){
    dd='0'+dd
  }
  if(mm<10){
    mm='0'+mm
  }
  today = yyyy+'-'+mm+'-'+dd;
  Restaurant.find({},function (err,rest){
    Food.find({}).exec(function (err,food){
      FoodType.find({},function(err,foodtype){
        Restaurant.find({},function (err,restaurant){
          Order.find({'customer':req.user._id,status:1}).populate('food').populate('restaurant').exec(function (err,order){
            Sale.find({date_from: today,status:true}).populate('restaurant').populate('food').exec(function(err,sale){
              console.log(sale)
              res.render('user/sale',{
                user:req.user,
                sale:sale,
                restaurant:restaurant,
                rest:rest,
                food:food,
                foodtype:foodtype,
                order:order,
                order_len:order.length
            })
          })
        })
      })
    })
  })})
});

router.post('/add-order/:foodID/restaurant/:restaurantID',function (req,res,next){
    const foodID = req.params.foodID;
    const userID = req.user._id;
    const restaurantID = req.params.restaurantID;
    const date = moment(new Date).format("MM/DD/YYYY, h:mm:ss");

    Order.findOneAndUpdate({customer:userID,
        restaurant:restaurantID,
        food:foodID,
        status:1},
      { $inc: {quantity:1},date:date },
      { upsert: true, new: true }, (err, doc) => {
        //console.log(doc);
        TotalOrder.findOneAndUpdate( { customer : userID,status:1}, {
          customer:userID,
          restaurant:restaurantID,
          $push: {
            orders:doc._id,
          }},{ upsert : true,new:true },function(err, doc) {
          if (err) throw err;
          User.updateOne({ _id: req.user._id},  {
            $push: {
              orders:doc._id
            }
          });
        });
        if (err) {
        console.log("Something wrong when updating data!");
      }
        res.send(doc);

    });
});

router.get('/restaurant/:id',function (req,res,next){
   Restaurant.find({_id:req.params.id},function (err,rest){
       const restID = req.params.id;
       const tipovi = [];
       Food.find({restaurant:restID}).populate('restaurant').populate('type').sort("type").exec(function (err,food){
         for(let t =0;t<food.length;t++){
           if(tipovi.includes(food[t].type.name) === false){
             tipovi.push(food[t].type.name)
           }
         }
         FoodType.find({},function(err,foodtype){
           Restaurant.find({},function (err,restaurant){
             Order.find({'customer':req.user._id,status:1}).populate('food').populate('restaurant').exec(function (err,order){
               res.render('user/restaurant',{
                 restaurant:restaurant,
                 rest:rest,
                 user:req.user,
                 food:food,
                 foodtype:foodtype,
                 tip:tipovi,
                 order:order,
                 order_len:order.length
               })
             })
           })
         })
       })
   })
});

router.delete('/order/:id/:food',function (req,res,next){
  Order.deleteOne({ _id: req.params.id , food:req.params.food }, function (err) {
    if (err) return err;
    else res.sendStatus(200);
  });
});

router.post('/send-order',function(req,res,next) {
  let dostavljacID;
  let najmanja = 100000000000;
  let vrijeme = req.body.vrijeme;
  const placanje = req.body.placanje;
  if(vrijeme==="undefined"){
    vrijeme = moment(new Date).format("MM/DD/YYYY, hh:mm:ss");
  }
  TotalOrder.findOne({customer: req.user._id,status: 1}, function(error, doc)  {
    if (error) {
      console.log("Something wrong when updating data!");
    }
    Supplier.find({restaurant:doc.restaurant,status:1},function(err,suppliers){
      Restaurant.findOne({_id:doc.restaurant},function(err,restaurant) {
        const adresa = restaurant.koordinate.replace("(", "").replace(")", "");
        const nova = adresa.split(",");
        let RestoranLatitude = parseFloat(nova[0]);
        let RestoranLongitude = parseFloat(nova[1]);
        //Trazi najmanju udaljenost između dostavljača i restorana
        for (let s = 0; s < suppliers.length; s++) {
          const adres = suppliers[s].koordinate.replace("(", "").replace(")", "");
          const nova = adres.split(",");
          var latitude1 = parseFloat(nova[0]);
          var longitude1 = parseFloat(nova[1]);
          var minimalna = geolib.getDistance({latitude: latitude1, longitude: longitude1},
            {latitude: RestoranLatitude, longitude: RestoranLongitude}, accuracy = 1);
          console.log("MINIMALNA: " + minimalna)
          if (minimalna < najmanja) {
            najmanja = minimalna;
            dostavljacID = (ObjectId(suppliers[s]._id));
          }
          console.log("NAJMANJA" + najmanja);
          console.log(dostavljacID, typeof dostavljacID);
        }
        TotalOrder.findOneAndUpdate({_id:doc._id,status:1},{supplier:dostavljacID,status:2,date:vrijeme,payment:placanje},{upsert: true, new: true},function(err,totalOrder){
            Supplier.findOneAndUpdate({_id:dostavljacID},{status:2,
              $push: {
                orders:doc._id,
              }},{new: true},function(err,supplier){
              if (err) {
                console.log("Something wrong when updating data!");
              }
          })
        });
        })
      });
    })
  //nodemailer sa w3schools :)
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'nodeprojekat@gmail.com',
      pass: 'node1234'
    }
  });

  var mailOptions = {
    from: 'nodeprojekat@gmail.com',
    to: req.user.email,
    subject: 'Order update',
    text: 'Dear, '+req.user.name+' your order has been created and we are waiting delivery confirmation.'+
      'You will be notified when it happens . Please be patient .'
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
  Order.updateMany({status: 1, customer: req.user._id}, {
    "$set": {"status": 2}},
    {multi: true}, function (err, doc) {
    if (err) throw err;
    else {
      res.redirect("/users/dashboard");
    }
  });
});

router.get('/profile',function(req,res,next){
  User.findOne({ _id: req.user._id },function (err,user){
    TotalOrder.find({customer:req.user._id}).populate([{
      path: 'orders',
      populate: {
        path: 'food',
        model: 'Food'
      }
    }]).populate('restaurant').populate('customer').exec(function(err,orders){
      res.render('user/profile',{
        user:user,
        orders:orders
      })
    })
  });
});

router.post('/profile',upload.single('picture'),function(req,res,next){
  let {name, address,koordinate, email, password} = req.body;
  let newPassword;
  const modified = moment(new Date).format("MM/DD/YYYY, h:mm:ss");
  if (!req.file && password === "") {
    User.updateOne({_id: req.user._id},
      {
        name: name,
        address: address,
        koordinate:koordinate,
        email: email,
        modified: modified,
      },
      function (error, success) {
        if(error) console.log("Error "+error.message);
        res.redirect('/users/profile');
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
            User.updateOne({_id: req.user._id},
              {
                name: name,
                address: address,
                email: email,
                modified: modified,
                koordinate:koordinate,
                password:newPassword
              },
              function (error, success) {
                res.redirect('/users/profile');
              });
          }
        })
      }
    });
  }
  else if(req.file && password === ""){
    User.updateOne({_id: req.user._id},
      {
        picture:req.file.filename,
        name: name,
        address: address,
        email: email,
        modified: modified,
        koordinate:koordinate
      },
      function (error, success) {
        res.redirect('/users/profile');
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
            User.updateOne({_id: req.user._id},
              {
                picture: req.file.filename,
                name: name,
                address: address,
                email: email,
                modified: modified,
                password:newPassword,
                koordinate:koordinate
              },
              function (error, success) {
                if(error)console.log("error"+error+error.message);
                if(success)console.log("success: " +success)
                res.redirect('/users/profile');
              });
          }
        })
      }
    });
  }
});

router.get('/foodType/:id',function (req,res,next){
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1;
  var yyyy = today.getFullYear();
  if(dd<10){
    dd='0'+dd
  }
  if(mm<10){
    mm='0'+mm
  }
  today = yyyy+'-'+mm+'-'+dd;
  Restaurant.find({},function (err,rest) {
    Food.find({}).exec(function (err, food) {
      FoodType.find({}, function (err, foodtype) {
        Restaurant.find({}, function (err, restaurant) {
          Order.find({
            'customer': req.user._id,
            status: 1
          }).populate('food').populate('restaurant').exec(function (err, order) {
            Sale.find({date_from: today, status: true}).populate('restaurant').populate('food').exec(function (err, sale) {
              Food.find({type: req.params.id}).populate('restaurant').populate('type').exec(function (err, foodS) {
                res.render('user/foodType', {
                  user: req.user,
                  sale: sale,
                  restaurant: restaurant,
                  rest: rest,
                  food: food,
                  foodS: foodS,
                  foodtype: foodtype,
                  order: order,
                  order_len: order.length
                })
              })
            })
          })
        })
      })
    })
  });

});

module.exports = router;
