const bcrypt = require('bcrypt');
const User = require('../models/User');

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
        // OTURUM VERİSİNİ ATA
        req.session.userID = user._id;

        // KRİTİK: Session'ı kaydet ve bittikten sonra yönlendir
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
    res.redirect('/'); // Oturum silindikten sonra ana sayfaya gönder
  });
};
exports.logoutUser =(req, res) =>{
req.session.destroy(()=> {
res.redirect('/');})}
exports.getDashboardPage = async (req, res)=> {
  const user=await User.findOne({_id:req.session.userID})
res.status(200).render('dashboard', {
page_name: 'dashboard',
user
});};