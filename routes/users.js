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
                Order.find({'customer':req.user._id,status:true},function (err,order)
                {
                    res.render('dashboard',{
                        user:req.user,
                        food:food,
                        foodtype:foodtype,
                        restaurant:restaurant,
                        restoran:JSON.stringify(restaurant),
                        order:order.length
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

module.exports = router;
