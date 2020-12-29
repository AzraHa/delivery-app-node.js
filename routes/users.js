const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/login',userController.login_get);
router.post('/login',userController.login_post);
router.get('/register',userController.registration_get);
router.post('/register',userController.registration_post);
router.get('/logout',userController.logout);
router.get('/dashboard',userController.dashboard);




module.exports = router;
