module.exports = (req, res, next) => {
  if (req.session.userID) {
    // Eğer kullanıcı zaten giriş yapmışsa, onu ana sayfaya (veya dashboard'a) gönder
    return res.redirect('/');
  }
  // Giriş yapmamışsa, Login/Register sayfasına gitmesine izin ver
  next();
};