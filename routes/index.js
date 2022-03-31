var express = require('express');
var router = express.Router();
var url = require('url');
var fs = require('fs');
var path = require('path');

var mydb = require('../lib/mydb.js');
var db = require('../lib/db');
var auth = require('../lib/auth');
var template = require('../lib/template');


router.get('/', function(request, response){
  mydb.query(`SELECT * FROM airline`, function(err, nameOfAirline){
    if(err){
      throw err;
    }
    //var nameOfAirline = db.get('nameOfAirline').value(); //JSON 파일을 사용할 경우
    console.log("2", nameOfAirline);
      var select = template.select(nameOfAirline);
      var body = `
      <div class="b">
        <form action = "/page/confirm" method = "post">
          <span>
            ${select}
            <span id="icon"><i class="fa fa-search"></i></span>
            <input type="text" name = "flight" id="search" placeholder="항공편 입력" />
            <button type="submit">확인</button>
          </span>
        </form>
      </div>
      `
      var authStatusUI =  auth.statusUI(request, response);
      var html = template.HTML(body, authStatusUI);
      response.send(html);

  })


  // else{
  //   var _url = request.url;
  //   var queryData = url.parse(_url, true).query;
  //     var filteredID = path.parse(queryData.id).base;
  //     fs.readFile(`data/${filteredID}`, 'utf8', function(err, body){
  //       //var title = queryData.id;
  //       var list = template.List(request.list);
  //       var html = template.HTML(body, list);
  //
  //       response.writeHead(200);//200 : 파일을 성공적으로 전송했다는 의미
  //       response.end(html);//변수 templete에 들어있는 templete literal코드를 화면에 출력.
  //     });
  //
  // }
});

  module.exports = router;
