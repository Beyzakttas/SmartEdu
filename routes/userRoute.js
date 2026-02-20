const express = require('express');
const { body } = require('express-validator');
const User = require('../models/User');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// 1. SIGNUP (Kayıt) - Validasyonlar dahil
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

// 2. LOGIN (Giriş)
router.route('/login').post(authController.loginUser);

// 3. LOGOUT (Çıkış)
// Controller içinde res.clearCookie('jwt') yaptığımızdan emin olmalısın!
router.route('/logout').get(authController.logoutUser); 

// 4. DASHBOARD (Korumalı Sayfa)
// authMiddleware sayesinde giriş yapmayanlar buraya erişemez
router.route('/dashboard').get(authMiddleware, authController.getDashboardPage);

// 5. USER OPERATIONS (Silme ve Güncelleme)
// method-override kullanarak dashboard.ejs içindeki formlardan tetikleyebilirsin
router.route('/:id').delete(authController.deleteUser);
router.route('/:id').put(authController.updateUser);

module.exports = router;