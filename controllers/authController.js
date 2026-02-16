const bcrypt = require('bcrypt');
const User = require('../models/User');
const Category = require('../models/Category');
const Course = require('../models/Course');

exports.createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).redirect('/login');
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
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
        res.status(400).send('Şifreniz hatalı!');
      }
    } else {
      res.status(400).send('Böyle bir kullanıcı bulunamadı!');
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
    // KRİTİK GÜNCELLEME: .populate('courses') ekledik. 
    // Böylece öğrencinin kayıt olduğu kursların detayları (isim, açıklama vb.) gelecek.
    const user = await User.findOne({ _id: req.session.userID }).populate('courses');
    const categories = await Category.find();
    
    // Öğretmen ise sadece kendi oluşturduğu kursları getir
    const courses = await Course.find({ user: req.session.userID });

    res.status(200).render('dashboard', {
      page_name: 'dashboard',
      user,
      categories,
      courses
    });
  } catch (error) {
    res.status(400).redirect('/login');
  }
};