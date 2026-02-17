const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const User = require('./models/User'); 
const methodOverride = require('method-override');

const pageRoute = require('./routes/pageRoute');
const courseRoute = require('./routes/courseRoute');
const categoryRoute = require('./routes/categoryRoute');
const userRoute = require('./routes/userRoute');
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
app.use(async (req, res, next) => {
  res.locals.userIN = req.session.userID;
  
  if (req.session.userID) {
    try {
      const user = await User.findById(req.session.userID);
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
const port = 3000;
app.listen(port, () => {
  console.log(`App started on port ${port}`);
});