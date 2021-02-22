const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
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

router.get('/login',userController.login_get);
router.post('/login',userController.login_post);
router.get('/register',userController.registration_get);
router.post('/register',userController.registration_post);
router.get('/logout',userController.logout);
router.get('/dashboard',function(req,res,next){
  Food.find({}).populate('restaurant').sort({"modified" : -1}).limit(6).exec(function(err,food){
        FoodType.find().exec(function (err,foodtype){
            Restaurant.find({}).exec(function (err,allRestaurants){
                  User.findOne({_id: req.user._id}, function (err, user) {
                      const adresa = user.koordinate.replace("(", "").replace(")", "");
                      const nova = adresa.split(",");
                      let userLatitude = parseFloat(nova[0]);
                      let userLongitude = parseFloat(nova[1]);
                      console.log("koordinate" + userLatitude + " " + userLongitude);
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
                      console.log("restorani: " + restorani)

                      Order.find({
                        'customer': req.user._id,
                        status: 1
                      }).populate('food').populate('restaurant').exec(function (err, order) {
                        //console.log("ORDER-LEN"+order.length+" ORD#ER "+order)
                        res.render('dashboard', {
                          user: req.user,
                          food: food,
                          foodtype: foodtype,
                          restaurant: restorani,
                          restoran: JSON.stringify(allRestaurants),
                          order_len: order.length,
                          order: order
                        });
                      });
                    })
                  })
                })
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
      res.render('search', {
        user: req.user,
        food: food,
        tip:req.body.nazivArtikla
      });
    }
  });
});

router.get('/order/:id',function (req,res,next){

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
               res.render('restaurant',{
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
        TotalOrder.findOneAndUpdate({_id:doc._id,status:1},{supplier:dostavljacID,status:2},{upsert: true, new: true},function(err,totalOrder){
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



module.exports = router;
