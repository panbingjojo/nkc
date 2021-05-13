var nationCode = '86';

function chooseCountryNum(value) {
	nationCode = parseInt(value);
}

function error_report(str){
  geid('error_info').innerHTML = '<strong style="color:red;">'+str+'</strong>';
  display('error_info_panel');  //下面的提示框
  screenTopWarning(str);
}

function info_report(str){
  geid('error_info').innerHTML = '<strong style="color:#4169E1;">'+str+'</strong>';
  display('error_info_panel');  //下面的提示框
  screenTopWarning(str);
}

function error_report2(str){
  geid('error_info2').innerHTML = '<strong style="color:red;">'+str+'</strong>';
  display('error_info_panel2');  //下面的提示框
  screenTopWarning(str);
}

function info_report2(str){
  geid('error_info2').innerHTML = '<strong style="color:#4169E1;">'+str+'</strong>';
  display('error_info_panel2');  //下面的提示框
  screenTopAlert(str);
}






function submit(){
  return Promise.resolve()
  .then(function(){
    var userobj={
      username : gv('username'),
      mobile:gv('phone'),
      mcode:gv('mcode')//,
      //icode:gv('icode')
    }

    if(userobj.username == ''){
      getFocus("#username")
      throw({error:'请填写用户名！'})
      return
    }
    if(userobj.mobile == ''){
      getFocus("#phone")
      throw({error:'请填写手机号码！'})
      return;
    }
    /*if(userobj.mobile.length < 11){
      //refreshICode();
      getFocus("#phone")
      throw({error:'手机号码格式不正确！'})
      return;
    }*/
    if(userobj.mcode == ''){
      //refreshICode();
      getFocus("#mcode")
      throw({error:'请填写手机验证码！'})
      return;
    }
    return nkcAPI('/forgotPassword/mobile', 'POST', {username: userobj.username, mobile: userobj.mobile, mcode: userobj.mcode, nationCode: nationCode});
  })
    .then(function(data){
      window.location = '/forgotPassword/mobile?mobile='+data.mobile+'&mcode='+data.mcode+'&nationCode='+data.nationCode;
    })
    .catch(function(data){
      error_report(data.error||data);
    })
}



function submit2(){
  var mobile = $('#phone2').val();
  var mcode = $('#mcode2').val();
  var password = $('#password').val();
  var password2 = $('#password2').val();
	var nationCode = $('#nationCode').val();
  return Promise.resolve()
  .then(function(){
  	if(mobile === '') {
  		throw {error: '请填写手机号码。'};
	  }
	  var reg = /^[0-9]*$/;
	  if(!reg.test(mobile)) {
		  getFocus("#phone2");
		  return error_report('手机号码格式不正确。')
	  }
    /*if(!mobile.match(/^0?(13[0-9]|15[012356789]|17[013678]|18[0-9]|14[57])[0-9]{8}$/)) {
      throw ('非法的手机号码')
    }*/
    if(password == ''){
      getFocus("#password");
      throw {error: '请填写密码。'};
      return;
    }
    if(password.length < 8){
      getFocus("#password");
      throw {error: '密码长度不能小于8位。'};
      return;
    }
    if(checkPass(password) < 2){
      getFocus("#password");
      throw {error: '密码要具有数字、字母和符号三者中的至少两者。'};
      return;
    }
    if(password != password2){
      getFocus("#password2")
      throw {error: '两遍密码不一致。'};
      return;
    }
    return nkcAPI('/forgotPassword/mobile', 'PUT',{mobile:mobile, mcode:mcode, password:password, nationCode: nationCode})
  })
  .then(function(res){
    info_report2('修改密码成功！')
    setTimeout(function(){
      window.location = '/'
    },5000)
  })
  .catch(function(data){
    error_report2(data.error);
  })

}



function getMcode(){
  var phone = geid('phone').value.trim();
  var username = geid('username').value.trim();
  //var icode = geid('icode').value.trim();

  if(username == ''){
    getFocus("#username")
    return error_report('请填写用户名。')
  }
  if(phone === '') {
	  getFocus("#phone")
	  return error_report('请填写手机号码。')
  }
  /*if(phone == '' || phone.length < 11 ||
  !phone.match(/^0?(13[0-9]|15[012356789]|17[013678]|18[0-9]|14[57])[0-9]{8}$/))
  {
    getFocus("#phone")
    return error_report('手机号码为空或者格式不正确！')
  }*/
  /*if(icode == ''){
    getFocus("#icode")
    return error_report('请填写图形验证码！')
  }*/

  else{
    nkcAPI('/sendMessage/getback','post' ,{mobile:phone, username:username/*, icode:icode */, nationCode: nationCode})
    .then(function(res){
      var count = 120;
      var countdown = setInterval(CountDown, 1000);
      function CountDown() {
          $("#getMcode").attr("disabled", true);
          $("#getMcode").text(count + "秒后可重发");
          if (count == 0) {
              $("#getMcode").text("获取手机验证码");
              $("#getMcode").val("Submit").removeAttr("disabled");
              clearInterval(countdown);
          }
          count--;
      }
    })
    .catch(function(data){
      // if(data.error === '没有找到该手机号码，请检查') {
      //   ////refreshICode3();
      // }
      // else if(data.error === '用户名和手机号码不对应，请检查') {
      //   ////refreshICode3();
      // }
      error_report(data.error);
    })
  }
}

/*function //refreshICode3() {
  nkcAPI('//refreshICode3')
    .then(function(res){
      $("#icodeImg").attr("src","/static/captcha/captcha3.svg?"+ Math.random() );
    })
}*/

//点击刷新图形验证码
/*
$(document).ready(function() {
	 $("#icodeImg").click(//refreshICode3)
	 })
*/


function getFocus(a){
  $(a).css('border-color','#f88')
  $(a).focus()
  $(a).blur(function(){
    $(a).css('border-color','')
  })
}


//检查密码复杂度
function checkPass(s){
   var ls = 0;
   if(s.match(/([a-zA-Z])+/)){
      ls++;
   }
   if(s.match(/([0-9])+/)){
      ls++;
   }
   if(s.match(/[^a-zA-Z0-9]+/)){
      ls++;
   }
   return ls
 }

Object.assign(window, {
  chooseCountryNum,
  error_report,
  info_report,
  error_report2,
  info_report2,
  submit,
  submit2,
  getMcode,
  getFocus,
  checkPass,
});
