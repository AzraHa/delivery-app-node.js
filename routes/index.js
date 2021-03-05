var express = require('express');
const {isLoggedIN} = require("../config/auth");
var router = express.Router();

router.get('/',isLoggedIN,function (req,res,next){
    res.render('index');
});

module.exports = router;
