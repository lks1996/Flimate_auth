var express = require('express');
var router = express.Router();
var fs = require('fs');
var shortid = require('shortid');
var bcrypt = require('bcrypt');

var db = require('../lib/db');
var template = require('../lib/template.js');
var auth = require('../lib/auth');
var mailSender = require('../lib/mailSender.js');

var authNum = '';
function makeAuthNum(){
    authNum = Math.floor((Math.random()*900000)+100000);
}

module.exports = function (passport) {
  router.get('/login', function (request, response) {
    var authStatusUI =  auth.statusUI(request, response);
    var body = `
      <div class="b">
        <form action="/auth/login_process" method="post">
          <p>Sign in with<a href="/auth/google"><img class="google_login" src="/images/google_login.png"/></a></p>
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

  router.get('/join', function (request, response) {
    var authStatusUI =  auth.statusUI(request, response);
    var body = `
    <script type="text/javascript">
    function formChk(){
      if(!(document.getElementById("pEmail").value)){
        alert("이메일을 입력하십시오.");
        return false;

      } else{
        return true;
      }
    }

    function blockFunc(){
      alert("중복 확인을 진행하십시오.");
    }
    </script>

    <div class="b">
      <form name="joinForm" action="/auth/join2" method="post" onsubmit="return formChk();">
        <p>
            <strong>E-mail:  </strong>
            <input type="text" name="email" id="pEmail" placeholder="email">
            <input type="checkbox" name="emailCheck" id="pEmailCheck" hidden>
            <input type="submit" value="중복 확인"onclick="openChild();">
        </p>
        <p class="f"><strong>Password:  </strong><input type="password" name="pwd" placeholder="password" value="111111"></p>
        <p class="f"><strong>Password:  </strong><input type="password" name="pwd2" placeholder="confirm password" value="111111"></p>
        <p class="g"><strong>Display Name:  </strong><input type="text" name="displayName" placeholder="display name" value="egoing"></p>
        <p>
          <input type="button" value="Join" onclick="blockFunc();">
        </p>
      </form>
    </div>
    `
    //var list = template.List(request.list);
    var html = template.HTML(body, authStatusUI);
    response.send(html);
  });

  router.post('/join2', function (request, response) {
    var post = request.body;
    var email = post.email;
    var pwd = post.pwd;
    var pwd2 = post.pwd2;
    var displayName = post.displayName;
    var user = db.get('users').find({
      email: email
    }).value();
    var authStatusUI =  auth.statusUI(request, response);
    var bodyTagParam = ``;
    var body = `
    <script type="text/javascript">
    alert("중복된 이메일입니다.");
    window.history.back();
    </script>
    `
    //이메일이 중복되지 않는 경우
    if(user == undefined){
      bodyTagParam = `
      <script type="text/javascript">
        function pop()
        {
          alert("사용가능한 이메일입니다.");
          window.open('/auth/sendmail', "팝업창", "width = 500, height = 500, top = 50, left = 50, location = no");
        }
        </script>
        <body onLoad="javascript:pop()">
      `;
      body = `
      <script type="text/javascript">
      function formChk(){
        if(!(document.getElementById("pEmailCheck").checked)){
          alert("이메일 인증을 진행하십시오.");
          return false;

        } else{
          return true;
        }
      }
      </script>

      <div class="b">
        <form name="joinForm" action="/auth/join_process" method="post" onsubmit="return formChk();">
          <p>
              <strong>E-mail:  </strong>
              <input type="text" name="email" id="pEmail" value=${email} readonly>
              <input type="checkbox" name="emailCheck" id="pEmailCheck" hidden>
              <input type="button" value="메일 인증">
          </p>
          <p class="f"><strong>Password:  </strong><input type="password" name="pwd" placeholder="password" value=${pwd}></p>
          <p class="f"><strong>Password:  </strong><input type="password" name="pwd2" placeholder="confirm password" value=${pwd2}></p>
          <p class="g"><strong>Display Name:  </strong><input type="text" name="displayName" placeholder="display name" value=${displayName}></p>
          <p>
            <input type="submit" value="Join">
          </p>
        </form>
      </div>
      `;
    }

    //var list = template.List(request.list);
    var html = template.HTML(body, authStatusUI, bodyTagParam);
    response.send(html);
  });

  router.get('/sendmail', function(request, response){
    var body = `
    <script type="text/javascript">
    window.onload=function(){
      document.getElementById("cInput").value = opener.document.getElementById("pEmail").value;
    }
    </script>
    <form action="/auth/authmail" method="post">
      <p>
        <input type="text" id="cInput" name="email" readonly>
      </p>
      <p>
        <input type="text" placeholder="인증번호 입력">
        <button type="submit">인증번호 발송</button>
      </p>
    </form>
    `
    var html = template.HTML(body, '');
    response.send(html);
  });

  router.post('/authmail', function(request, response){
    var post = request.body;
    console.log(post);

    makeAuthNum();
    console.log("1:"+authNum);
    var mailSubject = `Flimate 인증번호`;
    var mailText = `
    Flimate의 메일 인증번호가 도착했습니다.

    인증번호 : ${authNum}
    `
    mailSender.sendGmail(post.email, mailSubject, mailText);

    var body = `
    <form action="authmail_process" method="post">
      <p>
        <input type="text" id="cInput" value=${post.email} readonly>
      </p>
      <p>
        <input type="text" name="inputAuthNum" placeholder="인증번호 입력">
        <button type="submit">인증</button>
      </p>
    </form>
    `
    var html = template.HTML(body, '');
    response.send(html);
  });

//인증번호 비교 후, 결과에 따라 부모 페이지 설정.
  router.post('/authmail_process', function(request, response){
    var post = request.body;
    var body = ``

    console.log(post);

    if(post.inputAuthNum === (authNum+'')){
      body = `
      <script type="text/javascript">
        window.onload=function(){
          opener.document.getElementById("pEmailCheck").checked = 'true';
          window.close();
        }
      </script>
      `
      console.log("goood");
    }
    else{
      console.log("BADDD try agin");
      response.redirect('/auth/sendmail');
    }

    var html = template.HTML(body, '');
    response.send(html);
  });

  router.post('/join_process', function (request, response) {
    var post = request.body;
    var email = post.email;
    var pwd = post.pwd;
    var pwd2 = post.pwd2;
    var displayName = post.displayName;
    var user = db.get('users').find({
      email: email
    }).value();

    //비밀번호가 일치하지 않는 경우
    if (pwd !== pwd2) {
      response.send(`
        <script type="text/javascript">
        alert("비밀번호가 일치하지 않습니다.");
        window.history.back();
        </script>
        `);
    //비밀번호가 일치하는 경우
    } else {

      //db.json에 이메일이 없는 경우 회원가입 진행
        bcrypt.hash(pwd, 10, function (err, hash) {

          console.log("!!!!!!!!!!!!!!!!!!", user);
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
