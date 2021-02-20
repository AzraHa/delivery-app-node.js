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

    Order.findOneAndUpdate({customer:userID,
        restaurant:restaurantID,
        food:foodID,
        status:1},
      { $inc: {quantity:1} },
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
  let nizNarudzbi = [];
  const niz = req.body.ovo;
  for(let i = 0; i<niz.length;i++){
    nizNarudzbi.push(ObjectId(niz[i]._id));
  }
  const restoran = ObjectId(req.body.restoran);
  let totalOrder = new TotalOrder({
    customer: req.user._id,
    restaurant:restoran,
    status: 1
  });


    TotalOrder.updateOne({_id: totalOrder._id, customer: req.user._id,status: 1}, {
      $push: {
        orders:{552:jzfguz}}
    }, {upsert: true, new: true}, (err, sucess) => {
      if (err) {
        console.log("Something wrong when updating data!");
      }
    });




  Order.updateMany({status: 1, customer: req.user._id}, {"$set": {"status": 2}}, {multi: true}, function (err, doc) {
    if (err) throw err;
    else {
     // console.log(doc);
      res.redirect("/users/dashboard");
    }
  });
});



module.exports = router;
