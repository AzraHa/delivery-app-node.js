var express = require('express');
var router = express.Router();
const {ensureAuthenticated} = require('../config/auth');
var multer  = require('multer');
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    let extArray = file.mimetype.split("/");
    let extension = extArray[extArray.length - 1];
    cb(null, file.fieldname + '-' + Date.now()+ '.' +extension)
  }
})
const upload = multer({ storage: storage });

/* GET home page. */
router.get('/',function (req,res,next){
  res.render('indeks', {title: 'index'});
});
router.post('/upload', upload.single('photo'), (req, res) => {
  if(req.file) {
    res.json(req.file);
  }
  else throw 'error';
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
