const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const Food = require('../models/Food');
const FoodType = require('../models/FoodType');
const Sale = require('../models/Sale');
const Restaurant = require("../models/Restaurant");
const Order = require("../models/Order");


router.get('/login',userController.login_get);
router.post('/login',userController.login_post);
router.get('/register',userController.registration_get);
router.post('/register',userController.registration_post);
router.get('/logout',userController.logout);
router.get('/dashboard',function(req,res,next){
    Food.find({}).populate('restaurant').sort({"modified" : -1}).limit(6).exec(function(err,food){
        FoodType.find().exec(function (err,foodtype){
            Restaurant.find({},function (err,restaurant){
                Order.find({'customer':req.user._id,status:true}).populate('food').populate('restaurant').exec(function (err,order)
                {
                    console.log("ORDER-LEN"+order.length+" ORD#ER "+order)
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

router.post('/add-order/:id/restaurant/:restaurantID',function (req,res,next){
    const foodID = req.params.id;
    const userID = req.user._id;
    const restaurantID = req.params.restaurantID;
    const order = new Order({
        customer:userID,
        restaurant:restaurantID,
        food:foodID,
        status:true
    });
    order.save();
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

module.exports = router;
