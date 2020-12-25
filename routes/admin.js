const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminControllers');

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

router.get('/customers/active',adminController.find_customers_active);

router.get('/customers/inactive',adminController.find_customers_inactive);

router.get('/delete-customers/:id', adminController.delete_customers);

router.get('/add-restaurant-admin',adminController.add_admin_get);

router.post('/add-restaurant-admin',adminController.add_admin_post);

router.get('/dashboard/customers/active/:id',function (req,res,next) {
  User.find({_id: req.params.id,status:true}, function(err, docs){
    if(err) res.json(err);
    else    res.json( {user: docs[0]._id});
  });
});

router.get('/dashboard/customers/inactive/:id',function (req,res,next) {
  User.find({_id: req.params.id,status:false}, function(err, docs){
    if(err) res.json(err);
    else    res.json( {user: docs[0]._id});
  });
});


module.exports = router;
