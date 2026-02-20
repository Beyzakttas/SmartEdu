const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const Category = require('../models/Category');
const Course = require('../models/Course');
const jwt = require('jsonwebtoken');

// 1. KULLANICI KAYDI
exports.createUser = async (req, res) => {
    try {
        await User.create(req.body);
        req.flash("success", "Kayıt işlemi başarılı! Giriş yapabilirsiniz.");
        res.status(201).redirect('/login');
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            req.flash("error", messages[0]);
        } else if (error.code === 11000) {
            req.flash("error", "Bu e-posta adresi zaten kullanımda!");
        } else {
            req.flash("error", "Kayıt sırasında bir hata oluştu.");
        }
        res.status(400).redirect('/register');
    }
};

// 2. KULLANICI GİRİŞİ (JWT + Cookie Entegrasyonu)
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user) {
            const isSame = await bcrypt.compare(password, user.password);

            if (isSame) {
                // JWT Token Oluştur
                const token = jwt.sign({ userID: user._id }, 'secret_key_buraya', {
                    expiresIn: '1d',
                });

                // Token'ı Cookie olarak gönder
                res.cookie('jwt', token, {
                    httpOnly: true,
                    maxAge: 24 * 60 * 60 * 1000,
                });

                req.session.userID = user._id; 
                res.status(200).redirect('/users/dashboard');
            } else {
                req.flash("error", "Your password is not correct!");
                res.status(400).redirect('/login');
            }
        } else {
            req.flash("error", "User does not exist!");
            res.status(400).redirect('/login');
        }
    } catch (error) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

// 3. KULLANICI ÇIKIŞI (KRİTİK GÜNCELLEME!)
exports.logoutUser = (req, res) => {
    res.clearCookie('jwt'); // ÖNCE: Tarayıcıdaki JWT anahtarını silmelisin
    req.session.destroy(() => { // SONRA: Sunucudaki session'ı yok etmelisin
        res.redirect('/'); 
    });
};

// 4. DASHBOARD SAYFASI (Populate Edilmiş Versiyon)
exports.getDashboardPage = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.session.userID }).populate('courses');
        const categories = await Category.find();
        
        // Önemli: Kursları çekerken kategori ve kullanıcı detaylarını da getiriyoruz (Admin ekranı için)
        const courses = await Course.find()
            .populate('category')
            .populate('user');
        
        const users = await User.find(); 

        res.status(200).render('dashboard', {
            page_name: 'dashboard',
            user,
            categories,
            courses,
            users
        });
    } catch (error) {
        res.status(400).redirect('/login');
    }
};

// 5. KULLANICI SİLME (Admin Yetkisi)
exports.deleteUser = async (req, res) => {
    try {    
        await User.findByIdAndDelete(req.params.id);
        await Course.deleteMany({user: req.params.id});
        req.flash("success", "User and their courses have been removed.");
        res.status(200).redirect('/users/dashboard');
    } catch (error) {
        res.status(400).json({ status: 'fail', error });
    }
};

// 6. KULLANICI GÜNCELLEME
exports.updateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id, 
            {
                name: req.body.name,
                email: req.body.email,
                role: req.body.role
            },
            { new: true, runValidators: true }
        );

        req.flash("success", `${user.name} başarıyla güncellendi!`);
        res.status(200).redirect('/users/dashboard');
    } catch (error) {
        req.flash("error", "Güncelleme yapılamadı.");
        res.status(400).redirect('/users/dashboard');
    }
};