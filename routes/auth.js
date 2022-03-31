var express = require('express');
var router = express.Router();
var fs = require('fs');
var shortid = require('shortid');
var bcrypt = require('bcrypt');

var db = require('../lib/db');
var template = require('../lib/template.js');
var auth = require('../lib/auth');


module.exports = function (passport) {
  router.get('/login', function (request, response) {
    var authStatusUI =  auth.statusUI(request, response);
    var body = `
      <div class="b">
        <form action="/auth/login_process" method="post">
          <p><strong>E-mail:  </strong><input type="text" name="email" placeholder="email" value="egoing7777@gmail.com"></p>
          <p class="f"><strong>Password:  </strong><input type="password" name="pwd" placeholder="password" value="111111"></p>
          <p>
            <button type="submit">Login</button>
          </p>
        </form>
      </div>
      `
      //var list = template.List(request.list);
      var html = template.HTML(body,authStatusUI);
      response.send(html);

  });


  router.post('/login_process', passport.authenticate('local',
	{failureRedirect: '/auth/login'}),
    function(req, res){
    req.session.save(function(){
        console.log('session save...');
        res.redirect('/');
    })
  })

  router.get('/register', function (request, response) {
    var authStatusUI =  auth.statusUI(request, response);
    var body = `
    <div class="b">
      <form action="/auth/register_process" method="post">
        <p><strong>E-mail:  </strong><input type="text" name="email" placeholder="email" value="egoing7777@gmail.com"></p>
        <p class="f"><strong>Password:  </strong><input type="password" name="pwd" placeholder="password" value="111111"></p>
        <p class="f"><strong>Password:  </strong><input type="password" name="pwd2" placeholder="confirm password" value="111111"></p>
        <p class="g"><strong>Display Name:  </strong><input type="text" name="displayName" placeholder="display name" value="egoing"></p>
        <p>
          <button type="submit">Join</button>
        </p>
      </form>
    </div>
    `
    //var list = template.List(request.list);
    var html = template.HTML(body, authStatusUI);
    response.send(html);
  });

  router.post('/register_process', function (request, response) {
    var post = request.body;
    var email = post.email;
    var pwd = post.pwd;
    var pwd2 = post.pwd2;
    var displayName = post.displayName;
    if (pwd !== pwd2) {
      response.redirect('/auth/register');
    } else {
      bcrypt.hash(pwd, 10, function (err, hash) {
        var user = db.get('users').find({
          email: email
        }).value();
        if (user) {
          user.password = hash;
          user.displayName = displayName;
          db.get('users').find({id:user.id}).assign(user).write();
        } else {
          var user = {
            id: shortid.generate(),
            email: email,
            password: hash,
            displayName: displayName
          };
          db.get('users').push(user).write();
        }

        request.login(user, function (err) {
          console.log('redirect');
          return response.redirect('/');
        })
      });
    }
  });

  router.get('/logout', function (request, response) {
    request.logout();
    request.session.save(function () {
      response.redirect('/');
    });
  });

  return router;
}
