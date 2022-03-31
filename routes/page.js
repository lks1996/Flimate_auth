var express = require('express');
var router = express.Router();

var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var path = require('path');
var sanitizeHtml = require('sanitize-html');
//var db = require('./db.js');
//var mailSender = require('./mailSender.js');
var template = require('../lib/template');
var auth = require('../lib/auth');
var mydb = require('../lib/mydb.js');
var mailSender = require('../lib/mailSender.js');

router.get('/feedback', function(request, response){
  var body = `
  <h1 style="display:inline">
  </h1>
  <div class="a">
    <h2 style="display:inline">
    </h2>
  </div>
  <p>
    <div id="disqus_thread"></div>
  <script>
      /**
      *  RECOMMENDED CONFIGURATION VARIABLES: EDIT AND UNCOMMENT THE SECTION BELOW TO INSERT DYNAMIC VALUES FROM YOUR PLATFORM OR CMS.
      *  LEARN WHY DEFINING THESE VARIABLES IS IMPORTANT: https://disqus.com/admin/universalcode/#configuration-variables    */
      /*
      var disqus_config = function () {
      this.page.url = "http://localhost:3000/page/feedback";  // Replace PAGE_URL with your page's canonical URL variable
      this.page.identifier = PAGE_IDENTIFIER; // Replace PAGE_IDENTIFIER with your page's unique identifier variable
      };
      */
      (function() { // DON'T EDIT BELOW THIS LINE
      var d = document, s = d.createElement('script');
      s.src = 'https://flight-mate.disqus.com/embed.js';
      s.setAttribute('data-timestamp', +new Date());
      (d.head || d.body).appendChild(s);
      })();
  </script>
  <noscript>Please enable JavaScript to view the <a href="https://disqus.com/?ref_noscript">comments powered by Disqus.</a></noscript>
    </p>
    `
  var authStatusUI =  auth.statusUI(request, response);
  var html = template.HTML(body, authStatusUI);
  response.send(html);
});

router.post('/confirm', function(request, response){
    var post = request.body;
    console.log(post);
    //var authStatusUI =  auth.statusUI(request, response);
    if(request.user){
      //항공편 자리 유효성 검사.
      if(!(post.flight.length == 5 || post.flight.length == 6)){
        console.log('Unvalid flight name');
        response.redirect('/')
      }
      //항공편 자리수가 유효하면 db에서 사용자가 입력한 항공편명의 항공사 이름을 가져옴.
    else{          //flight 테이블에서 사용자가 입력한 항공편 이름이 있으면 그 이름을 validTestOfFlight로 반환하고, 값이 없는 경우에 '0'을 반환.
      mydb.query(`SELECT IFNULL(MAX(name), '0') AS name FROM flight WHERE name=?`, [post.flight], function(err, validTestOfFlight){
        if(validTestOfFlight[0].name == '0'){

          response.redirect('/')
        }
        else{     //사용자가 입력한 항공편 이름이 flight테이블에 있는 경우, 해당 항공편의 항공사 이름(airline.name)을 가져옴.
          mydb.query(`SELECT airline.name FROM airline LEFT JOIN flight ON airline.id=flight.airline_id WHERE flight.name=?`, [post.flight], function(err, result){
            console.log(result);

           //사용자가 입력한 항공사와 mydb에 저장되어있는 사용자입 항공편의 항공사가 같을 경우,
            if(result[0].name == post.airline){
              mydb.query(`SELECT IFNULL(MAX(table_name), '0') AS table_name FROM information_schema.tables WHERE table_name =?`, [post.flight], function(err, table_name_result){

                //사용자가 입력한 항공편의 테이블이 없다면,
                if(table_name_result[0].table_name == '0'){
                  mydb.query(`SELECT id FROM flight WHERE name=?`,[post.flight], function(err, flight_id){
                    mydb.query(`CREATE TABLE ${post.flight} (seat_id VARCHAR(3) NOT NULL PRIMARY KEY, email VARCHAR(20), flight_id INT(2) DEFAULT ${flight_id[0].id})`, function(err, create){//쿼리문에 테이블명을 직접 가져오지 않고 매핑을 통해 가져오고 싶은데 그건 왜 안되는거지..
                      console.log(create);

                      response.redirect(`/page/seat?id=${post.flight}`);
                    });
                  })

                  //사용자가 입력한 항공편의 테이블이 이미 존재한다면,
                } else{
                  console.log("already exist table");

                  response.redirect(`/page/seat?id=${post.flight}`);
                }
              });
            }
            //사용자가 입력한 항공사와 mydb에 저장되어있는 사용자입력 항공편의 항공사가 다른 경우,
            else{
              response.redirect('/')
            }
          });
        }
      });
      }
    }
  });

  router.get('/seat', function(request, response){
    var _url = request.url;// /seat?id=AW756
    console.log(_url);
    var queryData = url.parse(_url, true).query;// {id: AW756}
    console.log(queryData);
    var filteredID = path.parse(queryData.id).base; //AW756
    console.log(filteredID);
    var userEmail = request.user.email;
    mydb.query(`SELECT seat_id FROM ${filteredID}`, function(err, seat_id_list){
      var authStatusUI =  auth.statusUI(request, response);
      var body = template.seatList(filteredID, seat_id_list, userEmail);
      var html = template.HTML(body, authStatusUI);

      response.send(html);
    })
  });

  router.post('/userRequest', function(request, response){
    var post = request.body;
    var lower_seat_name = post.seat_name.toLowerCase();
    var _url = request.url;// /seat?id=AW756
    var queryData = url.parse(_url, true).query;// {id: AW756}
    var filteredID = path.parse(queryData.id).base; //AW756
    mydb.query(`SELECT IFNULL(MAX(seat_id), '0') AS seat_id FROM ${filteredID} WHERE seat_id=?`, [post.seat_name], function(err, valid_seat_id){

      if(valid_seat_id[0].seat_id == '0'){
        mydb.query(`INSERT INTO ${filteredID} (seat_id, email) VALUES(?, ?)`, [lower_seat_name, post.email], function(err, email_insert_request){//좌석 이름은 무조건 소문자로 저장
          console.log(post.seat_name +"좌석에 앉은 사용자의 이메일"+ post.email +"등록이 완료되었습니다");
        })
      }
      else{
        mydb.query(`SELECT email FROM ${filteredID} WHERE seat_id=?`, [post.seat_name], function(err, email_request){
          console.log(email_request[0].email+"로 이메일 연결 요청을 했습니다.");
          console.log(post.email);
          var mailSubject = `Flimate 이메일 연락 요청`;
          var mailText = `이메일 연락 요청이 도착했습니다.

          요청자 좌석 : ${post.user_seat}
          요청자 email 주소 : ${post.email}`
          mailSender.sendGmail(email_request[0].email, mailSubject, mailText);//저장되있던 email, , 요청한 사용자의 email
        })
      }
    })
    response.redirect(`/page/seat?id=${post.flight_name}`);
  });

  module.exports = router;
