const express = require('express');
const app = express();
var bodyParser = require('body-parser');
var fs = require('fs');
var compression = require('compression');
var helmet = require('helmet')
app.use(helmet());
var session = require('express-session')
var FileStore = require('session-file-store')(session)
const { expressCspHeader, INLINE, NONE, SELF } = require('express-csp-header');



app.use(express.static('public'));
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(compression());
app.use(session({
  secret: 'asadlfkj!@#!@#dfgasdg',
  resave: false,
  saveUninitialized: true,
  store: new FileStore()
}))

var passport = require('./lib/passport')(app);

app.get('*', function (request, response, next) {
  fs.readdir('./data', function(err, fileList){
    request.list = fileList;
    next();
  })
});

app.use(expressCspHeader({
  directives: {
    'script-src': [SELF, INLINE, "https://kit.fontawesome.com/8eb5905426.js", "https://flight-mate.disqus.com/embed.js", "https://disqus.com/?ref_noscript", "https://flight-mate.disqus.com/embed.js"],
  }
}))

var indexRouter = require('./routes/index');
var pageRouter = require('./routes/page');
var authRouter = require('./routes/auth')(passport);

app.use('/', indexRouter);
app.use('/page', pageRouter);
app.use('/auth', authRouter);

app.use(function (req, res, next) {
  res.status(404).send('Sorry cant find that!');
});

app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
});

app.listen(3000, ()=> console.log('Express app listening on port 3000!'));
