var express = require('express');
var router = express.Router();
const {ensureAuthenticated} = require('../config/auth');

/* GET home page. */
router.get('/',function (req,res,next){
  res.render('index', {title: 'index'});
});

router.get('/map',function (req,res,next){
  res.render('map');
})
/* GET home page. */
router.get('/dashboard',ensureAuthenticated, function(req, res, next) {
  res.render('dashboard', {
    user: req.user
  })
});
router.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});
module.exports = router;
