const express = require('express');
const { body } = require('express-validator'); // Validator'ı ekledik
const User = require('../models/User'); // Email kontrolü için User modelini ekledik
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// SIGNUP ROTASI: Kontrol mekanizmasını buraya ekledik
router.route('/signup').post(
    [
        body('name').not().isEmpty().withMessage('Please Enter Your Name'),
        body('email').isEmail().withMessage('Please Enter Valid Email')
        .custom((userEmail) => {
            return User.findOne({email:userEmail}).then(user => {
                if (user) {
                    return Promise.reject('Email already exists!');
                }
            })
        }),
        body('password').not().isEmpty().withMessage('Please Enter A Password'),
    ],
    authController.createUser
);

router.route('/login').post(authController.loginUser);
router.route('/logout').get(authController.logoutUser); 
router.route('/dashboard').get(authMiddleware, authController.getDashboardPage);
router.route('/:id').delete(authController.deleteUser);
module.exports = router;