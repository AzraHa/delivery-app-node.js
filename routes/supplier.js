const express = require('express');
const TotalOrder = require("../models/TotalOrder");
const Supplier = require("../models/Supplier");
const bcrypt = require('bcryptjs');
const passport = require('passport');
const moment = require('moment');
const upload = require('../controllers/uploadController');
const nodemailer = require('nodemailer');
const User = require("../models/User");
const {isAuthenticatedSupplier} = require("../config/auth");
const router = express.Router();

router.get('/login',function (req,res,next){
  res.render('supplier/login');
});

router.post('/login',function(req,res,next){
  passport.authenticate('supplier', {
    successRedirect: '/supplier/dashboard',
    failureRedirect: '/supplier/login',
    failureFlash: true
  })(req, res, next);
});

router.get('/dashboard',isAuthenticatedSupplier,function (req,res,next){
  TotalOrder.find({status: 2,supplier:req.user._id}).populate([{path: 'orders', populate: {path: 'food', model: 'Food'}}]).populate('customer').populate('restaurant').exec(function(err,orders){
      if(err) return err;
      //Odradjene narudzbe imaju polje status 5
        TotalOrder.find({status: 5,supplier:req.user._id}).populate([{path: 'orders', populate: {path: 'food', model: 'Food'}}]).populate('customer').populate('restaurant').exec(function(err,ordersN) {
            if(err) return err;
            //Narudzbe u toku
            TotalOrder.find({status: 3,supplier:req.user._id}).populate([{path: 'orders', populate: {path: 'food', model: 'Food'}}]).populate('customer').populate('restaurant').exec(function(err,ordersA) {
                if(err) return err;
                res.render('supplier/dashboard',
                    {user: req.user,
                        orders: orders,
                        ordersN: ordersN,
                        ordersA:ordersA
                    });
            });
        });
  });
});

router.get('/logout',isAuthenticatedSupplier,function (req,res,next){
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/supplier/login');
});

router.get('/order-confirm/:id',isAuthenticatedSupplier,function (req,res,next){
  TotalOrder.findOne({_id: req.params.id}).populate([{path: 'orders', populate: {path: 'food', model: 'Food'}}]).populate('customer').populate('restaurant').exec(function (err, order) {
      if(err) return err;
      res.render('supplier/confirm-order',{user:req.user,order:order})
    });
});
router.post('/order-confirm/:id/:customer',isAuthenticatedSupplier,function (req,res,next){
  //status 3 narudzba potvrđena od strane dostavljaca
  TotalOrder.updateOne({ _id: req.params.id},  {status: 3}, {new: true}).populate({path:'restaurant', model: 'Restaurant' }).populate({path:'customer', model: 'User' }).exec(function(err,doc) {
    if (err) console.log("Something wrong when updating data!");
    Supplier.findOneAndUpdate({_id: req.user._id},{s_address:req.body.newAddress,koordinate:req.body.newKoordinate}).populate({path: 'restaurant', model: 'Restaurant'}).exec(function (err, supplier) {
        if(err) return err;
        User.findOne({_id:req.params.customer},function(err,user){
            if(err) return err;
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'nodeprojekat@gmail.com',
                    pass: 'node1234'
                }
            });
            const mailOptions = {
                from: supplier.email,
                to: user.email,
                subject: 'Order Confirmed',
                text: 'Your order has been confirmed by our supplier and it is at your door on ' + moment(doc.date).add(30, 'm')
            };
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) console.log(error);
                else console.log('Email sent: ' + info.response);
            }).then(r => res.redirect('/supplier/dashboard'));
        });
    });
  });
});
router.get('/profile',isAuthenticatedSupplier,function(req,res,next){
  Supplier.findOne({_id:req.user._id},function(err,supplier){
      if(err) return err;
      res.render('supplier/profile',
          {user:req.user,
              supplier:supplier
          });
  })
});
router.post('/active-order/:id',isAuthenticatedSupplier,function(req,res,next){
  TotalOrder.findOneAndUpdate({_id:req.params.id},{status:5,rated:false},{new:true},function(err,supplier) {
      if(err) return err;
      Supplier.findOneAndUpdate({_id: req.user._id},{status:1},{new:true}).populate({path: 'restaurant', model: 'Restaurant'}).exec(function (err, supplier) {
          if(err) return err;
          const restaurantEmail = (supplier.restaurant[0].email)
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: 'nodeprojekat@gmail.com',
                  pass: 'node1234'
                }
            });
          const mailOptions = {
              from: supplier.email,
                to: restaurantEmail,
                subject: 'Order Delivered',
                text: 'I ' + supplier.name + ' delivered the order ' + req.params.id
          };
          transporter.sendMail(mailOptions, function (error, info) {
              if (error)  console.log(error);
              else console.log('Email sent: ' + info.response);
          }).then(r => res.redirect('/supplier/dashboard'));
    })
  });
});

router.post('/profile',isAuthenticatedSupplier,upload.single('picture'),async function (req,res,next){
  let {name, address,koordinate, email, password} = req.body;
  let newPassword;
  const modified = moment().format("MM/DD/YYYY, h:mm:ss");
  if (!req.file && password === "") {
    Supplier.updateOne({_id: req.user._id},
        {
          name: name,
          s_address: address,
          koordinate:koordinate,
          email: email,
          modified: modified,
        },
        function (error, success) {
          if(error) console.log("Error "+error.message);
          res.redirect('/supplier/profile');
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
            Supplier.updateOne({_id: req.user._id},
                {
                  name: name,
                  s_address: address,
                  email: email,
                  modified: modified,
                  koordinate:koordinate,
                  password:newPassword
                },
                function (err) {
                  if(err) return err;
                  res.redirect('/supplier/profile');
            });
          }
        })
      }
    });
  }
  else if(req.file && password === ""){
    Supplier.updateOne({_id: req.user._id},
        {
          picture:req.file.filename,
          name: name,
          s_address: address,
          email: email,
          modified: modified,
          koordinate:koordinate
        },
        function (err) {
        if(err) return err;
        res.redirect('/supplier/profile');
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
            Supplier.updateOne({_id: req.user._id},
                {
                  picture: req.file.filename,
                  name: name,
                  s_address: address,
                  email: email,
                  modified: modified,
                  password:newPassword,
                  koordinate:koordinate
                },
                function (error, success) {
                  if(error)console.log("error"+error+error.message);
                  if(success)console.log("success: " +success)
                  res.redirect('/supplier/profile');
                });
          }
        })
      }
    });
  }
});

module.exports = router;
