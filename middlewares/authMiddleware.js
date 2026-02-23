const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;

        if (token) {
            jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
                if (err) {
                    // Token geçersizse temizlik yap
                    req.session.userID = null; // Session'ı temizle
                    res.clearCookie('jwt');   // Çerezi temizle
                    res.locals.user = null;
                    return res.redirect('/login');
                } else {
                    const user = await User.findById(decodedToken.userID);
                    
                    if (!user) {
                        req.session.userID = null;
                        res.clearCookie('jwt');
                        res.locals.user = null;
                        return res.redirect('/login');
                    }

                    // Kullanıcıyı sisteme tanıt
                    req.user = user;
                    res.locals.user = user;
                    next();
                }
            });
        } else {
            // İSTEDİĞİN SENARYO: Çerez manuel silindiyse buraya düşer
            req.session.userID = null; // Sunucu tarafındaki oturumu bitir
            res.locals.user = null;    // Arayüz değişkenini sıfırla
            
            // Yeni bir tarayıcı açmış gibi ana sayfaya yönlendir
            return res.redirect('/'); 
        }
    } catch (error) {
        req.session.userID = null;
        res.locals.user = null;
        res.redirect('/login');
    }
};