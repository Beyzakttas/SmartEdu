const express = require('express');
const pageRoute = require('./routes/pageRoute');

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

// GLOBAL VARIABLE
app.use((req, res, next) => {
  res.locals.page_name = '';
  next();
});

app.use('/', pageRoute);

const port = 3000;
app.listen(port, () => {
  console.log(`App started on port ${port}`);
});