const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const User = require('./models/User'); 
const methodOverride = require('method-override');
const fileUpload = require('express-fileupload'); // <-- 1. BURAYI EKLE

const pageRoute = require('./routes/pageRoute');
const courseRoute = require('./routes/courseRoute');
const categoryRoute = require('./routes/categoryRoute');
const userRoute = require('./routes/userRoute');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const app = express();

// 1. Mongoose Connection
mongoose.connect('mongodb://127.0.0.1:27017/smartedu-db')
  .then(() => console.log('MongoDB bağlantısı başarılı!'))
  .catch(err => console.error('Bağlantı hatası:', err));

// 2. View Engine
app.set('view engine', 'ejs');

// 3. Middlewares (Static & Body Parser)
app.use(express.static('public'));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(cookieParser());
// ... diğer middleware'ler

app.use(
  methodOverride('_method', {
    methods: ['POST', 'GET'],
  })
);
// 4. Session Kurulumu (KRİTİK: Flash'tan ÖNCE burada olmalı)
app.use(session({
  secret: 'my_keyboard_cat',
  resave: false,
  saveUninitialized: false, 
  cookie: {
    secure: false, 
    maxAge: 1000 * 60 * 60 * 24 
  },
  store: (MongoStore.create ? 
    MongoStore.create({ mongoUrl: 'mongodb://127.0.0.1:27017/smartedu-db' }) : 
    MongoStore.default.create({ mongoUrl: 'mongodb://127.0.0.1:27017/smartedu-db' }))
}));

// 5. Flash ve Flash Mesaj Değişkeni (Session'dan SONRA)
app.use(flash());
app.use((req, res, next) => {
  res.locals.flashMessages = req.flash();
  next();
});

// 6. Global Variables & Role Check
// 6. Global Variables & JWT/Session Sync
app.use(async (req, res, next) => {
  // Hem session'dan hem de JWT çerezinden kullanıcı ID'sini kontrol et
  const sessionUserID = req.session.userID;
  const token = req.cookies.jwt;
  
  let currentUserID = sessionUserID;

  // Eğer session yok ama JWT varsa, JWT içindeki ID'yi kullan (Senkronizasyon için)
  if (!currentUserID && token) {
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, 'secret_key_buraya'); // authController'daki key ile aynı olmalı
      currentUserID = decoded.userID;
    } catch (err) {
      currentUserID = null;
    }
  }

  res.locals.userIN = currentUserID;

  if (currentUserID) {
    try {
      const user = await User.findById(currentUserID);
      res.locals.user = user; // Navbar bu değişkeni kullanıyor
    } catch (error) {
      res.locals.user = null;
    }
  } else {
    res.locals.user = null;
  }
  next();
});

// 7. Routes
app.use('/', pageRoute);
app.use('/courses', courseRoute);
app.use('/categories', categoryRoute);
app.use('/users', userRoute);

// 8. Port Configuration
const port = 3000;
app.listen(port, () => {
  console.log(`App started on port ${port}`);
});