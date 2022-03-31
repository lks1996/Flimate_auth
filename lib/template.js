module.exports = {
  HTML:function(body, authStatusUI){
    return `
        <!doctype html>
        <html lang="en" dir="ltr">
        <head>
          <meta charset="utf-8">
          <title>FliMate</title>
          <script src="https://kit.fontawesome.com/8eb5905426.js" crossorigin="anonymous"></script>
          <link rel="stylesheet" href="/css/style.css" />
        </head>
        <body>
          <h1 style="display:inline">
          <p>
            <a href='/' title='home'>
              <img class="logo" src="/images/Flimate_LOGO.PNG"/>
            </a>
          </p>
          </h1>
          <div class="a">
            <h2 style="display:inline">
              ${authStatusUI}
            </h2>
          </div>
          ${body}
        </body>
        </html>
        `;
      },
      List:function(fileList){
        var list = '<div class="a">';

        var i = 0;
        while (i < fileList.length) {
          list = list + `<h2 style="display:inline"><a
          href="/?id=${fileList[i]}">${fileList[i]}</a></h2>`;
          i = i + 1;
        }
        list = list + '</div>';
        return list;
      },
      select:function(nameOfAirline){
        var select = '<select name= "airline"><option value="">항공사 선택</option>';
        var i = 0;
        while(i <nameOfAirline.length){
          select = select + `<option value="${nameOfAirline[i].name}">${nameOfAirline[i].name}</option>`;
          i = i + 1;
        }
        select = select+'</select>';
        return select;
      },
      seatList:function(flight_name, seat_id_list, userEmail){
        var seatList = `
        <script type="text/javascript">
          function callFunction(obj){
            let span = document.getElementById('your_seat_td');
            let hidden = span.getAttribute("hidden");
            document.getElementById('now').value = obj.title;
            document.getElementById('user_seat').type = 'text';
            if(hidden){
              span.removeAttribute("hidden");
            }
            document.getElementById('cotect_btn').value = '요청하기';
          }


          function callFunction2(obj){
            let span = document.getElementById('your_seat_td');
            let hidden = span.getAttribute("hidden");
            document.getElementById('now').value = obj.title;
            document.getElementById('user_seat').type = 'hidden';
            if(!hidden){
              span.setAttribute("hidden", "hidden");
            }
            document.getElementById('cotect_btn').value = '확인';
          }
        </script>
        <strong>${flight_name}편의 좌석 데이터</strong>
        <div id="container">
        <ul id="airplane">
        `;
        var check = '';
        for(i=0; i<25; i++){
          var i2 = i+1;

          for(j=0; j<6; j++){
            var j2 = j+65;
            var eng = String.fromCharCode(j2);
            var db_exist = (i2+eng).toLowerCase();

            var result = seat_id_list.some(item => item.seat_id == db_exist);//seat_id_list 객체에서 seat_id 값이 db_exist인 값이 있으면 result 변수에 true를 저장.(db에 저장된 좌석명이 소문자일경우)
            //var result2 = seat_id_list.some(item => item.seat_id == (i2+eng));//seat_id_list 객체에서 seat_id 값이 db_exist인 값이 있으면 result 변수에 true를 저장.(db에 저장된 좌석명이 대문자일경우) 저장할 때 무조건 소문자로 저장하기 때문에 필요없는 코드인듯.
              //db에 이미 데이터가 있는 좌석일경우,
              if(result){
                seatList += `
                <li class="seat_${i2} ${eng}"><a href="javascript:void(0);" onclick="callFunction(this);" id="" title="${i2}${eng}"><input type="checkbox" name="${i2} ${eng}" checked disabled>${i2}${eng}</a></li>
                `;

                //db에 데이터가 없는 좌석일 경우,
              } else{
                seatList += `
                <li class="seat_${i2} ${eng}"><a href="javascript:void(0);" onclick="callFunction2(this);" id="" title="${i2}${eng}"><input type="checkbox" name="${i2} ${eng}" disabled>${i2}${eng}</a></li>
                `;
              }


          }
          seatList += `<p></p>
          `;
        }
        seatList += `
        </ul>
        </div>
        <form action="/page/userRequest?id=${flight_name}" method='post' name='form1' >
          <div class="c">
            <p>
              <strong>Your Email is : </strong>
              <input type="text" name="email" id="email" value=${userEmail} readonly>
            </p>
            <p class="d">
              <strong>Selected Seat : </strong>
              <input type="text" class="seat_input" name="seat_name" id="now" value="" readonly>
            </p>
            <p class="e">
              <span id='your_seat_td' hidden="hidden">
                <strong>Your Seat : </strong>
              </span>
              <input type="hidden" class="seat_input" name="user_seat" id="user_seat">
            </p>
            <button type="submit" class="" id="cotect_btn">확인</button>
            <input type='hidden' name='flight_name' value=${flight_name}>
          </div>
        </form>
        `;
        return seatList;
    }
}
