const express = require('express');
const TotalOrder = require("../models/TotalOrder");
const Supplier = require("../models/Supplier");
const bcrypt = require('bcryptjs');
const passport = require('passport');
const moment = require('moment');
const jwt = require("jsonwebtoken");
const upload = require('../controllers/uploadController');
const nodemailer = require('nodemailer');
const User = require("../models/User");

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
  const maxAge = 3 *24 *60 *60 ;
  const createToken = (id) => {
    return jwt.sign({id},'strasno',{
      expiresIn: maxAge
    });
  }
  const token = createToken(Supplier._id);
  res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
});

router.get('/dashboard',function (req,res,next){
  TotalOrder.find({status: 2,supplier:req.user._id})
    .populate([{
      path: 'orders',
      populate: {
        path: 'food',
        model: 'Food'
      }
    }]).populate('customer').populate('restaurant').
  exec(function(err,orders){
    //Odradjene narudzbe imaju polje status 5
    TotalOrder.find({status: 5,supplier:req.user._id})
      .populate([{
        path: 'orders',
        populate: {
          path: 'food',
          model: 'Food'
        }
      }]).populate('customer').populate('restaurant').
      exec(function(err,ordersN) {
        //Narudzbe u toku
      TotalOrder.find({status: 3,supplier:req.user._id}).populate([{
        path: 'orders',
        populate: {
          path: 'food',
          model: 'Food'
        }
      }]).populate('customer').populate('restaurant').
      exec(function(err,ordersA) {
        res.render('supplier/dashboard',
          {
            user: req.user,
            orders: orders,
            ordersN: ordersN,
            ordersA:ordersA
          });
      });
    });
  })
});

router.get('/logout',function (req,res,next){
  res.cookie('jwt','',{maxAge: 1 });
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/supplier/login');
});

router.get('/order-confirm/:id',function (req,res,next){
  TotalOrder.findOne({_id: req.params.id})
    .populate([{
      path: 'orders',
      populate: {
        path: 'food',
        model: 'Food'
      }
    }]).populate('customer').populate('restaurant')
    .exec(function (err, order) {
      res.render('supplier/confirm-order',{user:req.user,order:order})
    });
});
router.post('/order-confirm/:id/:customer',function (req,res,next){
  //status 3 narudzba potvrđena od strane dostavljaca
  TotalOrder.updateOne({ _id: req.params.id},  {
      status: 3
    },
    {new: true,upsert: true}).
  populate({path:'restaurant', model: 'Restaurant' }).populate({path:'customer', model: 'User' })
    .exec(function(err,doc) {
    if (err) {
      console.log("Something wrong when updating data!");
    }
    Supplier.findOne({_id: req.user._id}).populate({
      path: 'restaurant',
      model: 'Restaurant'
    }).exec(function (err, supplier) {
      User.findOne({_id:req.params.customer},function(err,user){
        var transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'nodeprojekat@gmail.com',
            pass: 'node1234'
          }
        });
        var mailOptions = {
          from: supplier.email,
          to: user.email,
          subject: 'Order Confirmed',
          text: 'Your order has been confirmed by our supplier and it is at your door in 30 minutes .'
        };

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });
      })
      const restaurantEmail = (supplier.restaurant[0].email)
      //nodemailer sa w3schools :)
      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'nodeprojekat@gmail.com',
          pass: 'node1234'
        }
      });
      var mailOptions = {
        from: supplier.email,
        to: restaurantEmail,
        subject: 'Order Confirmed',
        text: 'I '+supplier.name +' confirm the order ' + req.params.id
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
      res.redirect('/supplier/dashboard');
    });
  });
});
router.get('/profile',function(req,res,next){
  Supplier.findOne({_id:req.user._id},function(err,supplier){
    res.render('supplier/profile',
      {user:req.user,
      supplier:supplier})
  })
});
router.post('/active-order/:id',function(req,res,next){
  TotalOrder.findOneAndUpdate({_id:req.params.id},{status:5},{new:true},function(err,supplier) {
    Supplier.findOneAndUpdate({_id: req.user._id},{status:1},{new:true}).populate({
      path: 'restaurant',
      model: 'Restaurant'
    }).exec(function (err, supplier) {
      const restaurantEmail = (supplier.restaurant[0].email)
      //nodemailer sa w3schools :)
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
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
      res.redirect('/supplier/dashboard');
    })
  });
});
router.post('/profile',upload.single('picture'),async function (req,res,next){
  let {name, address, email, password,supplierID} = req.body;
  let newPassword;
  const modified = moment(new Date).format("MM/DD/YYYY, h:mm:ss");
  if (!req.file && password === "") {
    Supplier.updateOne({_id: supplierID},
      {
        name: name,
        address: address,
        email: email,
        date: modified,
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
            Supplier.updateOne({_id: supplierID},
              {
                name: name,
                address: address,
                email: email,
                date: modified,
                password:newPassword
              },
              function (error, success) {
                res.redirect('/supplier/profile');
              });
          }
        })
      }
    });
  }
  else if(req.file && password === ""){
    console.log("slika"+req.file.filename)
    Supplier.updateOne({_id: supplierID},
      {
        picture:req.file.filename,
        name: name,
        address: address,
        email: email,
        date: modified
      },
      function (error, success) {
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
            Supplier.updateOne({_id: supplierID},
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

module.exports = router;
