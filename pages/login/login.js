var app;
$(function() {
	app = new Vue({
		el: '#app',
		data: {
			warning: {
				username: '',
				password: '',
				mobile: '',
				code: '',
				error: ''
			},
			timeNumber: 0,
			username: '',
			password: '',
			mobile: '',
			code: '',
			sending: false,
			nationCodes: nationCodes,
			nationCode: '86',
			loginType: 'account',// mobile, code, account
			btnText: '登录'
		},
		watch: {
			/*loginType: function() {
				changeFocus();
			}*/
		},
		methods: {
			submit: function() {
				if(app.btnText === '登录中...') return;
				clearWarning();
				app.btnText = '登录中...';
				var obj;
				if(app.loginType === 'account') {
					if(!app.username) {
						app.warning.username = '请输入用户名';
						app.btnText = '登录';
						return;
					}
					if(!app.password) {
						app.warning.password = '请输入密码';
						app.btnText = '登录';
						return;
					}
					obj = {
						username: app.username,
						password: app.password
					};

				} else if(app.loginType === 'mobile') {
					if(!app.nationCode) {
						app.warning.error = '请选择国际区号';
						app.btnText = '登录';
						return;
					}
					if(!app.mobile) {
						app.warning.mobile = '请输入手机号';
						app.btnText = '登录';
						return;
					}
					if(!app.password) {
						app.warning.password = '请输入密码';
						app.btnText = '登录';
						return;
					}
					obj = {
						loginType: 'mobile',
						nationCode: app.nationCode,
						mobile: app.mobile,
						password: app.password
					}
				} else {
					if(!app.nationCode) {
						app.warning.error = '请选择国际区号';
						app.btnText = '登录';
						return;
					}
					if(!app.mobile) {
						app.warning.mobile = '请输入手机号';
						app.btnText = '登录';
						return;
					}
					if(!app.code) {
						app.warning.code = '请输入验证码';
						app.btnText = '登录';
						return;
					}
					obj = {
						loginType: 'code',
						nationCode: app.nationCode,
						mobile: app.mobile,
						code: app.code
					}
				}

				nkcAPI('/login', 'POST', obj)
					.then(function(data) {
						if(
							document.referrer.toString().indexOf('register')>=0 ||
							document.referrer.toString().indexOf('logout')>=0 ||
							document.referrer.toString().indexOf('login')>=0 ||
							document.referrer == ""
						)
						{
							location.href = '/'; //dont go back to register form
						}else{
							//alert(document.referrer)
							if(document.referrer.match('127.0.0.1:1086') || document.referrer.match('www.kechuang.org') ){
								location.href = '/';
							}else{
								location.href = document.referrer; //go back in history
							}
						}
					})
					.catch(function(data) {
						app.warning.error = data.error || data;
						app.btnText = '登录';
					})

			},
			changeType: function(type) {
				if(type === app.loginType) return;
				app.loginType = type;
				this.clearWarning();
			},
			clearWarning: clearWarning,
			sendCode: function() {
				if(app.timeNumber > 0) return;
				if(!app.mobile) {
					app.warning.mobile = '请输入手机号';
					return;
				}
				if(!app.nationCode) {
					app.warning.error = '请选择国际区号';
					return;
				}
				if(app.sending) return;
				app.sending = true;
				// 发送短信接口
				var obj = {
					nationCode: app.nationCode,
					mobile: app.mobile
				};
				nkcAPI('/sendMessage/login','POST', obj)
					.then(function() {
						app.sending = false;
						app.timeNumber = 120;
						timeOut();
					})
					.catch(function(data) {
						app.sending = false;
						app.warning.error = data.error || data;
					})
			}
		},
		directives: {
			focus: {
				inserted: focus,
			}
		}
	});
});

function focus(el, {value}) {
	if(value) {
		el.focus();
	}
}

function clearWarning() {
	app.warning.username = '';
	app.warning.password = '';
	app.warning.mobile = '';
	app.warning.code = '';
	app.warning.error = '';
}

/*function changeFocus() {
	var appDom = document.getElementById('app');
	var input = appDom.getElementsByTagName('input')[0];
	input.focus();
}*/
function timeOut(){
	setTimeout(function() {
		if(app.timeNumber === 0) return;
		app.timeNumber--;
		timeOut();
	}, 1000);
}