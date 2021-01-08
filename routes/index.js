var express = require('express');
var router = express.Router();
const {ensureAuthenticated} = require('../config/auth');

/* GET home page. */
router.get('/',function (req,res,next){
  res.render('indeks', {title: 'index'});
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
router.get('/naslovna',  function(req, res){
  res.render('index', { user: req.user });
});
module.exports = router;
