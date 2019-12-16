const createError = require('http-errors');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
require('dotenv').config();
const indexRouter = require('./routes/index');
const productsRouter = require('./routes/products');
const ordersRouter = require('./routes/orders');
const app = express();


// app.engine('html', require('ejs').renderFile);
// app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));
app.set('veiw-engine, ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//allow CORS
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH');
  next();
});

app.use('/view', express.static('view'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/products', productsRouter);
app.use('/orders', ordersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error.ejs', {error: err.status});
});

const port = process.env.PORT || 3000;
app.listen(port);

module.exports = app;