const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;

        if (token) {
            jwt.verify(token, 'secret_key_buraya', async (err, decodedToken) => {
                if (err) {
                    // Token bozuksa her şeyi temizle
                    res.clearCookie('jwt');
                    res.locals.user = null; 
                    return res.redirect('/login');
                } else {
                    const user = await User.findById(decodedToken.userID);
                    
                    if (!user) {
                        res.clearCookie('jwt');
                        res.locals.user = null;
                        return res.redirect('/login');
                    }

                    // KRİTİK NOKTA: Kullanıcıyı hem request'e hem de EJS'ye tanıtıyoruz
                    req.user = user;
                    res.locals.user = user; // Artık Navbar <%= user %> üzerinden çalışacak
                    next();
                }
            });
        } else {
            // Token yoksa Navbar'a kullanıcı olmadığını fısılda
            res.locals.user = null;
            return res.redirect('/login');
        }
    } catch (error) {
        res.locals.user = null;
        res.redirect('/login');
    }
};