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

router.get('/login',userController.login_get);
router.post('/login',userController.login_post);
router.get('/register',userController.registration_get);
router.post('/register',userController.registration_post);
router.get('/logout',userController.logout);
router.get('/dashboard',function(req,res,next){
    Food.find({}).populate('restaurant').sort({"modified" : -1}).limit(6).exec(function(err,food){
        FoodType.find().exec(function (err,foodtype){
            Restaurant.find({}).limit(6).exec(function (err,restaurant){
                Order.find({'customer':req.user._id,status:1}).populate('food').populate('restaurant').exec(function (err,order)
                {
                    //console.log("ORDER-LEN"+order.length+" ORD#ER "+order)
                    res.render('dashboard',{
                        user:req.user,
                        food:food,
                        foodtype:foodtype,
                        restaurant:restaurant,
                        restoran:JSON.stringify(restaurant),
                        order_len:order.length,
                        order:order
                    });
                });

            })
        })
    });
});
router.get('/order/:id',function (req,res,next){

});

router.post('/add-order/:foodID/restaurant/:restaurantID',function (req,res,next){
    const foodID = req.params.foodID;
    const userID = req.user._id;
    const restaurantID = req.params.restaurantID;
    const quantity = 1;
    const order = new Order({
      quantity:quantity,
      customer:userID,
      restaurant:restaurantID,
      food:foodID,
      status:1
    });
    order.save();
    User.updateOne({ _id: req.user._id},  {
      $push: {
        orders:order._id
      }
    });
    TotalOrder.findOneAndUpdate( { customer : userID,status:1}, {
      customer:userID,
      restaurant:restaurantID,
      $push: {
        orders:order._id,
      }},{ upsert : true },function(err, doc) {
      if (err) throw err;
    });
});

router.get('/restaurant/:id',function (req,res,next){
   Restaurant.find({_id:req.params.id},function (err,restaurant){
       const restID = restaurant[0]._id;
       Food.find({restaurant:restID}).populate('restaurant').exec(function (err,food){
           Sale.find({restaurant:restID}).populate('food').exec(function (err,sale){
               res.render('restaurant',{
                   restaurant:restaurant,
                   user:req.user,
                   food:food,
                   sale:sale
               })
           })
       })
   })
});
router.post('/send-order',function(req,res,next){
  TotalOrder.findOneAndUpdate( { customer : req.user._id,status:1}, {
    status:2,
   },{},function(err, doc) {
    if (err) throw err;
    //else {console.log(doc);}
  });
  Order.update( { status : 1,customer:req.user._id}, {"$set":{"status": 2,"address":req.body.address}},{multi: true},function(err, doc) {
    if (err) throw err;
    else {//console.log(doc);
      res.redirect("/users/dashboard");}
  })
});

module.exports = router;
