require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
// HATA BURADAYDI: .default eklendi
const MongoStore = require('connect-mongo').default; 
const User = require('./models/User'); 
const methodOverride = require('method-override');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');

const pageRoute = require('./routes/pageRoute');
const courseRoute = require('./routes/courseRoute');
const categoryRoute = require('./routes/categoryRoute');
const userRoute = require('./routes/userRoute');

const app = express();

// 1. Mongoose Connection - .env dosyasındaki URL kullanılıyor
mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log('MongoDB bağlantısı başarılı!'))
  .catch(err => console.error('Bağlantı hatası:', err));

// 2. View Engine
app.set('view engine', 'ejs');

// 3. Middlewares
app.use(helmet());
app.use(express.static('public'));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(cookieParser());

app.use(
  methodOverride('_method', {
    methods: ['POST', 'GET'],
  })
);

// 4. Session Kurulumu (MongoStore.create hatası için .default ile düzeltildi)
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false, 
  cookie: {
    secure: false, 
    maxAge: 1000 * 60 * 60 * 24 
  },
  store: MongoStore.create({ 
    mongoUrl: process.env.MONGODB_URL 
  })
}));

// 5. Flash Mesajları
app.use(flash());
app.use((req, res, next) => {
  res.locals.flashMessages = req.flash();
  next();
});

// 6. Global Variables & JWT/Session Sync
app.use(async (req, res, next) => {
  const sessionUserID = req.session.userID;
  const token = req.cookies.jwt;
  let currentUserID = sessionUserID;

  if (!currentUserID && token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      currentUserID = decoded.userID;
    } catch (err) {
      currentUserID = null;
    }
  }

  res.locals.userIN = currentUserID;

  if (currentUserID) {
    try {
      const user = await User.findById(currentUserID);
      res.locals.user = user; 
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
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App started on port ${port}`);
});