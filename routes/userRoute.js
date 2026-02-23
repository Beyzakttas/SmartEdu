const express = require('express');
const { body } = require('express-validator');
const User = require('../models/User');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware'); // Yeni eklendi

const router = express.Router();

// 1. SIGNUP (Kayıt)
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
router.route('/logout').get(authController.logoutUser); 

// 4. DASHBOARD (Korumalı Sayfa)
router.route('/dashboard').get(authMiddleware, authController.getDashboardPage);

// 5. USER OPERATIONS (Silme ve Güncelleme)
// ÖNEMLİ: Sadece ADMIN rolündeki kullanıcıların silme yapabilmesi için koruma eklendi.
router.route('/:id').delete(authMiddleware, roleMiddleware(['admin']), authController.deleteUser);
router.route('/:id').put(authMiddleware, authController.updateUser);

// routes/userRoute.js
router.route('/admin-add-user').post(authMiddleware, roleMiddleware(['admin']), authController.adminAddUser);
module.exports = router;