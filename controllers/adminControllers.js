const bcrypt = require('bcryptjs');
const passport = require('passport');
const Admin = require('../models/Admin');
const User = require('../models/User');
const Supplier = require('../models/suppliers');
const RestaurantAdmin = require('../models/RestaurantAdmin');
const Restaurant = require('../models/restourant');
const jwt = require('jsonwebtoken');
const {ensureAuthenticatedAdmin} = require('../config/auth');
const moment = require('moment'); // require

module.exports.admin_login_get = (req,res,next) => {
  res.render('admin/login');
}
module.exports.admin_register_get = (req,res,next) => {
  res.render('admin/register');
}

module.exports.admin_register_post = (req,res,next) => {
  const {name, email, password, password2, address} = req.body;
  let errors = [];
  const status = true;
  if (!name || !email || !password || !password2 || !address) {
    errors.push({msg: 'Please enter all fields'});
  }

  if (password !== password2) {
    errors.push({msg: 'Passwords do not match'});
  }

  if (password.length < 6) {
    errors.push({msg: 'Password must be at least 6 characters'});
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
      password,
      password2,
      address
    });
  }else {

    Admin.findOne({ email: email }).then(user => {
      if (user) {
        errors.push({ msg: 'Email already exists' });
        res.render('register', {
          errors,
          name,
          email,
          password,
          password2,
          address
        });
      } else {
        const newAdmin = new Admin({
          name,
          email,
          password,
          address,
          status
        });
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newAdmin.password, salt, (err, hash) => {
            if (err) throw err;
            newAdmin.password = hash;
            newAdmin
              .save()
              .then(user =>{
                req.flash(
                  'success_msg',
                  'You are now registered and can log in'
                );
                res.redirect('/admin/login');
              })
              .catch(err => console.log(err));
          });
        });
        console.log(newAdmin);
      }
    });
  }
}
module.exports.admin_login_post = (req,res,next) => {
  passport.authenticate('administrator', {
    successRedirect: '/admin/dashboard',
    failureRedirect: '/admin/login',
    failureFlash: true
  })(req, res, next);
  const maxAge = 3 *24 *60 *60 ;
  const createToken = (id) => {
    return jwt.sign({id},'strasno',{
      expiresIn: maxAge
    });
  }
  const token = createToken(Admin._id);
  res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
}

module.exports.admin_logout = (req,res,next) => {
  res.cookie('jwt','',{maxAge: 1 });
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/admin/login');
}
module.exports.find_customers = (req,res,next) => {
  const st = req.params.status;
  let status = true;
  if(st==="false") status = false;
  //console.log(st,typeof st);
  //console.log(status,typeof status);
  User.find({status:status}, function(err, Users){
    if (err)
      return done(err);

    if (Users) {
      console.log(Users);
      res.render('admin/users', {
        user: req.user,
        usersArray: Users,
        stat: status
      });
    }
  });
}


module.exports.find_restaurant_admin = (req,res,next) => {
  RestaurantAdmin.find({status:true})
      .populate('restaurant')
      .exec(function(err, resAdmin) {
        console.log(resAdmin);
        if (err) console.log(err);
        res.render('admin/admin-restaurant', {
          user: req.user,
          resAdminArray: resAdmin
        });
      });
}

module.exports.find_suppliers = (req,res,next) => {

  Supplier.find({})//sve restorane sa suppliers
    .populate('restaurant') // only works if we pushed refs to person.eventsAttended
    .exec(function(err, person) {
      console.log(person);
      if (err) console.log(err);
      res.render('admin/suppliers', {
        user: req.user,
        suppliersArray: person
      });
    });
  /*Restaurant
    .findOne({ name: 'Baze' })
    .populate('suppliers') // only works if we pushed refs to person.eventsAttended
    .exec(function(err, person) {
      if (err) console.log(err);
      console.log("res"+person);
    });*/
  /*Restaurant.find ({ '_id': '5ffb541d3f81fb13e0591dea'}).populate ('suppliers').exec (function (err, surveys) {
    return res.json (surveys);
  });*/
}

module.exports.delete_customers = (req,res,next) => {
  const query = {'_id': req.params.id};
  console.log(query);
  User.findOneAndUpdate(query, {status:false,modified:moment(new Date).format("MM/DD/YYYY, h:mm:ss")}, function(err, doc) {
    if (err) return res.send(500, {error: err});
    //console.log(query,status,doc);
    console.info('Successfully updated.');
    res.redirect('/admin/customers');
  });
}
module.exports.add_restaurant_admin_get = (req,res,next) => {
  Restaurant.find({})
    .exec(function(err, restaurant) {
      console.log(restaurant);
      if (err) console.log(err);
      res.render('admin/add-restaurant-admin', {
        user: req.user,
        restaurantsArray: restaurant
      });
    });
}
module.exports.add_restaurant_admin_post = (req,res,next) => {

  const {restaurantName, adminName, adminAddress, adminEmail, password} = req.body;
  const status = true;
  const newAdmin = new RestaurantAdmin({
    name: adminName,
    email: adminEmail,
    password: password,
    restaurant : restaurantName,
    address: adminAddress,
    status: status
  });
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newAdmin.password, salt, (err, hash) => {
      if (err) throw err;
      newAdmin.password = hash;
    });
  });
  newAdmin.save();
  Restaurant.updateOne({ _id: restaurantName}, {
    $push: {
        admin: {
          _id : newAdmin._id
        }
    }},
    function (error, success) {
      res.redirect('/admin/dashboard');
    });
}
