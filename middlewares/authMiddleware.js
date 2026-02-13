const User = require('../models/User');

module.exports = async (req, res, next) => {
    try {
        // req.session.userID var mı ve veritabanında bu kullanıcı hala mevcut mu?
        const user = await User.findById(req.session.userID);

        if (!user) {
            return res.redirect('/login');
        }

        // Kullanıcı bulunduysa devam et
        next();
    } catch (error) {
        // Bir hata oluşursa (örneğin DB bağlantısı koparsa) login'e yönlendir
        res.redirect('/login');
    }
};