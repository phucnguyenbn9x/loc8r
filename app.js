require('dotenv').load();
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var uglifyJs = require("uglify-js");
var fs = require('fs');
var passport = require('passport');

require('./app_api/models/db');
require('./app_api/config/passport');

var index = require('./app_server/routes/index');
var routesApi = require('./app_api/routes/index');
// var users = require('./app_server/routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'app_server', 'views'));
app.set('view engine', 'jade');

var appClientFiles = {
  'app.js': fs.readFileSync('app_client/app.js', 'utf8'),
  'addHtmlLineBreaks.filter.js': fs.readFileSync('app_client/common/filters/addHtmlLineBreaks.filter.js', 'utf8'),
  'about.controller.js': fs.readFileSync('app_client/about/about.controller.js', 'utf8'),
  'locationDetail.controller.js': fs.readFileSync('app_client/locationDetail/locationDetail.controller.js', 'utf8'),
  'home.controller.js': fs.readFileSync('app_client/home/home.controller.js', 'utf8'),
  'register.controller.js': fs.readFileSync('app_client/auth/register/register.controller.js', 'utf8'),
  'login.controller.js': fs.readFileSync('app_client/auth/login/login.controller.js', 'utf8'),
  'geolocation.service.js': fs.readFileSync('app_client/common/services/geolocation.service.js', 'utf8'),
  'loc8rData.service.js': fs.readFileSync('app_client/common/services/loc8rData.service.js', 'utf8'),
  'formatDistance.filter.js': fs.readFileSync('app_client/common/filters/formatDistance.filter.js', 'utf8'),
  'ratingStars.directive.js': fs.readFileSync('app_client/common/directives/ratingStars/ratingStars.directive.js', 'utf8'),
  'footerGeneric.directive.js': fs.readFileSync('app_client/common/directives/footerGeneric/footerGeneric.directive.js', 'utf8'),
  'navigation.directive.js': fs.readFileSync('app_client/common/directives/navigation/navigation.directive.js', 'utf8'),
  'navigation.controller.js' : fs.readFileSync('app_client/common/directives/navigation/navigation.controller.js','utf8'),
  'pageHeader.directive.js': fs.readFileSync('app_client/common/directives/pageHeader/pageHeader.directive.js', 'utf8'),
  'reviewModal.controller.js': fs.readFileSync('app_client/reviewModal/reviewModal.controller.js', 'utf8'),
  'authentication.service.js': fs.readFileSync('app_client/common/services/authentication.service.js', 'utf8')
};
var uglified = uglifyJs.minify(appClientFiles, {
  compress: false
});

fs.writeFile('public/angular/loc8r.min.js', uglified.code, function(err) {
  if (err) {
    console.log(err);
  } else {
    console.log('Script generated and saved: loc8r.min.js');
  }
});

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'app_client')));

app.use(passport.initialize());

app.use('/', index);
app.use('/api', routesApi);
// app.use('/users', users);

app.use(function(req, res) {
  res.sendfile(path.join(__dirname, 'app_client', 'index.html'));
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function(err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401);
    res.json({
      "message": err.name + ": " + err.message
    });
  }
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
