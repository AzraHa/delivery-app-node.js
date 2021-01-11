const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminControllers');
const Restaurant = require('../models/restourant');
const Supplier = require('../models/suppliers');
const upload = require('../controllers/uploadController');

/* GET home page. */
router.get('/dashboard',function (req,res,next){
  res.render('admin/dashboard', {
    user: req.user
  })
});

router.get('/login',adminController.admin_login_get);

router.post('/login',adminController.admin_login_post);

router.get('/register',adminController.admin_register_get);

router.post('/register',adminController.admin_register_post);

router.post('/login',adminController.admin_login_post);

router.get('/logout',adminController.admin_logout);

router.get('/customers/:status',adminController.find_customers);

router.get('/delete-customers/:id', adminController.delete_customers);

router.get('/add-restaurant-admin',adminController.add_restaurant_admin_get);

router.post('/add-restaurant-admin',adminController.add_restaurant_admin_post);

router.get('/dashboard/customers/active/:id',function (req,res,next) {
  User.find({_id: req.params.id,status:true}, function(err, docs){
    if(err) res.json(err);
    else    res.json( {user: docs[0]._id});
  });
});

router.get('/admins',adminController.find_restaurant_admin);
router.get('/suppliers',adminController.find_suppliers);

router.get('/user',function (req,res,next){
  res.send(req.user);
})

router.get('/add-restaurant',function (req,res,next){
  res.render('admin/add-restaurant',{user:req.user});
});

router.post('/add-restaurant',upload.single('picture'),function (req,res,next){

  const {name, email, address} = req.body;
  const image = req.file.filename;
  console.log('photo '+image);
  let errors = [];
  const status = true;
  Restaurant.findOne({ name: name,email:email }).then(resAdmin => {
    if (resAdmin) {
      errors.push({ msg: 'Restaurant already exists' });
      res.render('admin/add-restaurant', {
        errors,
        name,
        email,
        address
      });
    } else {
      const newRestaurant = new Restaurant({
        name, email, address,email,image,status
      });
      /*bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newAdmin.password, salt, (err, hash) => {
          if (err) throw err;
          newAdmin.password = hash;
          newAdmin
            .save()
            .then(user =>{
              res.redirect('/admin/dashboard');
            })
            .catch(err => console.log(err));
        });
      });*/
      console.log(newRestaurant);
      newRestaurant
        .save()
        .then(user =>{
          res.redirect('/admin/dashboard');
        })
    }
  });
});

router.get('/restaurants',function (req,res,next){
  Restaurant.find({status:true},function (err,Restaurant){
    if (err)
      return done(err);

    if (Restaurant) {
      console.log(Restaurant);
      res.render('admin/restaurants', {
        user: req.user,
        RestaurantArray: Restaurant
      });
    }
  });
});
router.get('/add-suppliers',function (req,res,next){
  Restaurant.find({status:true},function (err,restaurant){
    if (err)
      return done(err);
    if (restaurant) {
      console.log(restaurant);
      res.render('admin/add-suppliers', {
        user: req.user,
        restaurantArray: restaurant
      });
    }
  });
});
router.post('/add-suppliers',function (req,res,next){
  const {name, restaurantName,email,s_address} = req.body;
  const status = true;
  const comm = new Supplier({
        name:name,
        email:email,
        s_address:s_address,
        restaurant:restaurantName,
        status:status
  });
  comm.save();
  Restaurant.updateOne({ _id: restaurantName}, { $push: {
      suppliers: {
        _id : comm._id,
        "status" : comm.status
      }
    }  },
    function (error, success) {
      res.redirect('/admin/suppliers');
    });

});


module.exports = router;
