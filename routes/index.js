var express = require('express');
var router = express.Router();

router.get('/',function (req,res,next){
    res.redirect('/users/dashboard');
});

module.exports = router;
