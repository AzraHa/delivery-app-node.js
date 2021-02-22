var express = require('express');
var router = express.Router();

router.get('/',function (req,res,next){
  if (req.user) {
    res.redirect('/user/dashboard');
  } else {
    res.render('error', {title: 'index'});
  }
});



module.exports = router;
