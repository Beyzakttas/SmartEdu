const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator'); // En üste aldık
const User = require('../models/User');
const Category = require('../models/Category');
const Course = require('../models/Course');

exports.createUser = async (req, res) => {
  try {
    const errors = validationResult(req); // Route'dan gelen hataları yakala

    if (!errors.isEmpty()) {
      for (let i = 0; i < errors.array().length; i++) {
        req.flash("error", `${errors.array()[i].msg}`);
      }
      return res.status(400).redirect('/register');
    }

    await User.create(req.body);
    res.status(201).redirect('/login');
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      error,
    });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      const isSame = await bcrypt.compare(password, user.password);

      if (isSame) {
        req.session.userID = user._id;
        req.session.save(() => {
          res.status(200).redirect('/users/dashboard');
        });
      } else {
        req.flash("error", "Your password is not correct!"); // Flash mesajı ile daha şık olur
        res.status(400).redirect('/login');
      }
    } else {
      req.flash("error", "User is not exist!");
      res.status(400).redirect('/login');
    }
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

exports.logoutUser = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/'); 
  });
};

exports.getDashboardPage = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.session.userID }).populate('courses');
    const categories = await Category.find();
    const courses = await Course.find({ user: req.session.userID });
    
    // ADMIN İÇİN TÜM KULLANICILARI ÇEKELİM
    const users = await User.find(); 

    res.status(200).render('dashboard', {
      page_name: 'dashboard',
      user,
      categories,
      courses,
      users // Buraya users listesini ekledik!
    });
  } catch (error) {
    res.status(400).redirect('/login');
  }
};
exports.deleteUser = async (req, res) => {
  try {    
    // Kullanıcıyı sil
    await User.findByIdAndDelete(req.params.id);
    // O kullanıcıya ait tüm kursları sil (Temizlik!)
    await Course.deleteMany({user:req.params.id});

    req.flash("error", "User and their courses have been removed.");
    res.status(200).redirect('/users/dashboard');

  } catch (error) {
    res.status(400).json({
      status: 'fail',
      error,
    });
  }
};