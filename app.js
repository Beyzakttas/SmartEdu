const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const pageRoute = require('./routes/pageRoute');
const courseRoute = require('./routes/courseRoute');
const categoryRoute = require('./routes/categoryRoute');
const userRoute = require('./routes/userRoute');

const app = express();

// 1. Mongoose Connection
mongoose.connect('mongodb://127.0.0.1:27017/smartedu-db')
  .then(() => console.log('MongoDB bağlantısı başarılı!'))
  .catch(err => console.error('Bağlantı hatası:', err));

// 2. View Engine
app.set('view engine', 'ejs');

// 3. Middlewares
app.use(express.static('public'));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// 4. Session Kurulumu (Rotalardan ve Global Değişkenlerden ÖNCE gelmeli)
app.use(session({
  secret: 'my_keyboard_cat',
  resave: false,
  saveUninitialized: false, 
  cookie: {
    secure: false, 
    maxAge: 1000 * 60 * 60 * 24 
  },
  // Bu yazım hem eski hem yeni sürümlerde hatayı önler:
  store: (MongoStore.create ? 
    MongoStore.create({ mongoUrl: 'mongodb://127.0.0.1:27017/smartedu-db' }) : 
    MongoStore.default.create({ mongoUrl: 'mongodb://127.0.0.1:27017/smartedu-db' }))
}));
// 5. Global Variables (res.locals kullanarak güvenli hale getirdik)
app.use((req, res, next) => {
  res.locals.userIN = req.session.userID;
  console.log("Giriş Yapan ID:", req.session.userID); // Terminale bakacağız
  next();
});

// 6. Routes
app.use('/', pageRoute);
app.use('/courses', courseRoute);
app.use('/categories', categoryRoute);
app.use('/users', userRoute);

// 7. Port Configuration
const port = 3000;
app.listen(port, () => {
  console.log(`App started on port ${port}`);
});