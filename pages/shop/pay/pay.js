(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var data = NKC.methods.getDataById('data');
var app = new Vue({
  el: '#app',
  data: {
    rechargeSettings: data.rechargeSettings,
    userMainScore: data.userMainScore,
    mainScore: data.mainScore,
    totalMoney: data.totalMoney,
    ordersId: data.ordersId,
    payment: 'mainScore',
    password: ''
  },
  computed: {
    aliPay: function aliPay() {
      var a = this.rechargeSettings.aliPay;
      var totalPrice = this.totalMoney / (1 - a.fee);
      var feePrice = totalPrice - this.totalMoney;
      return {
        enabled: a.enabled,
        fee: a.fee,
        _fee: Number((a.fee * 100).toFixed(4)),
        totalPrice: Number(totalPrice.toFixed(2)),
        feePrice: Number(feePrice.toFixed(2))
      };
    },
    weChat: function weChat() {
      return this.rechargeSettings.weChat;
    },
    needRecharge: function needRecharge() {
      var userMainScore = this.userMainScore,
          totalMoney = this.totalMoney;
      return userMainScore / 100 < totalMoney;
    }
  },
  methods: {
    getUrl: NKC.methods.tools.getUrl,
    selectPayment: function selectPayment(type) {
      this.payment = type;
    },
    submit: function submit() {
      var password = this.password,
          ordersId = this.ordersId,
          totalMoney = this.totalMoney;
      var self = this;
      Promise.resolve().then(function () {
        if (!password) throw '请输入登录密码';
        return nkcAPI('/shop/pay', 'POST', {
          ordersId: ordersId,
          password: password,
          totalPrice: totalMoney
        });
      }).then(function () {
        sweetSuccess('支付成功');
        self.password = '';
        setTimeout(function () {
          NKC.methods.visitUrl('/shop/order');
        }, 3000);
      })["catch"](sweetError);
    },
    useAliPay: function useAliPay() {
      var ordersId = this.ordersId,
          aliPay = this.aliPay;
      var totalPrice = aliPay.totalPrice,
          feePrice = aliPay.feePrice;
      var newWindow = window.open();
      Promise.resolve().then(function () {
        return nkcAPI("/shop/pay/alipay?ordersId=".concat(ordersId, "&money=").concat(totalPrice), 'GET').then(function (data) {
          if (NKC.configs.platform === 'reactNative') {
            NKC.methods.visitUrl(data.alipayUrl, true);
          } else {
            newWindow.location = data.alipayUrl;
          }

          sweetInfo('请在浏览器新打开的窗口完成支付！若没有新窗口打开，请检查新窗口是否已被浏览器拦截。');
        })["catch"](function (err) {
          sweetError(err);

          if (newWindow) {
            newWindow.document.body.innerHTML = err.error || err;
          }
        });
      });
    }
  }
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3Nob3AvcGF5L3BheS5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLElBQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxPQUFKLENBQVksV0FBWixDQUF3QixNQUF4QixDQUFiO0FBRUEsSUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFKLENBQVE7QUFDbEIsRUFBQSxFQUFFLEVBQUUsTUFEYztBQUVsQixFQUFBLElBQUksRUFBRTtBQUNKLElBQUEsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLGdCQURuQjtBQUVKLElBQUEsYUFBYSxFQUFFLElBQUksQ0FBQyxhQUZoQjtBQUdKLElBQUEsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUhaO0FBSUosSUFBQSxVQUFVLEVBQUUsSUFBSSxDQUFDLFVBSmI7QUFLSixJQUFBLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFMWDtBQU1KLElBQUEsT0FBTyxFQUFFLFdBTkw7QUFPSixJQUFBLFFBQVEsRUFBRTtBQVBOLEdBRlk7QUFXbEIsRUFBQSxRQUFRLEVBQUU7QUFDUixJQUFBLE1BRFEsb0JBQ0M7QUFDUCxVQUFNLENBQUMsR0FBRyxLQUFLLGdCQUFMLENBQXNCLE1BQWhDO0FBQ0EsVUFBSSxVQUFVLEdBQUcsS0FBSyxVQUFMLElBQW1CLElBQUksQ0FBQyxDQUFDLEdBQXpCLENBQWpCO0FBQ0EsVUFBSSxRQUFRLEdBQUcsVUFBVSxHQUFHLEtBQUssVUFBakM7QUFDQSxhQUFPO0FBQ0wsUUFBQSxPQUFPLEVBQUUsQ0FBQyxDQUFDLE9BRE47QUFFTCxRQUFBLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FGRjtBQUdMLFFBQUEsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFGLEdBQVEsR0FBVCxFQUFjLE9BQWQsQ0FBc0IsQ0FBdEIsQ0FBRCxDQUhQO0FBSUwsUUFBQSxVQUFVLEVBQUUs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RyxDQUFDLEtBQUosSUFBYSxHQUFqRDtBQUNEO0FBQ0YsU0FkSSxDQUFQO0FBZUQsT0FqQkg7QUFrQkQ7QUFoRE07QUFoQ1MsQ0FBUixDQUFaIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY29uc3QgZGF0YSA9IE5LQy5tZXRob2RzLmdldERhdGFCeUlkKCdkYXRhJyk7XHJcblxyXG5jb25zdCBhcHAgPSBuZXcgVnVlKHtcclxuICBlbDogJyNhcHAnLFxyXG4gIGRhdGE6IHtcclxuICAgIHJlY2hhcmdlU2V0dGluZ3M6IGRhdGEucmVjaGFyZ2VTZXR0aW5ncyxcclxuICAgIHVzZXJNYWluU2NvcmU6IGRhdGEudXNlck1haW5TY29yZSxcclxuICAgIG1haW5TY29yZTogZGF0YS5tYWluU2NvcmUsXHJcbiAgICB0b3RhbE1vbmV5OiBkYXRhLnRvdGFsTW9uZXksXHJcbiAgICBvcmRlcnNJZDogZGF0YS5vcmRlcnNJZCxcclxuICAgIHBheW1lbnQ6ICdtYWluU2NvcmUnLFxyXG4gICAgcGFzc3dvcmQ6ICcnLFxyXG4gIH0sXHJcbiAgY29tcHV0ZWQ6IHtcclxuICAgIGFsaVBheSgpIHtcclxuICAgICAgY29uc3QgYSA9IHRoaXMucmVjaGFyZ2VTZXR0aW5ncy5hbGlQYXk7XHJcbiAgICAgIGxldCB0b3RhbFByaWNlID0gdGhpcy50b3RhbE1vbmV5IC8gKDEgLSBhLmZlZSk7XHJcbiAgICAgIGxldCBmZWVQcmljZSA9IHRvdGFsUHJpY2UgLSB0aGlzLnRvdGFsTW9uZXk7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgZW5hYmxlZDogYS5lbmFibGVkLFxyXG4gICAgICAgIGZlZTogYS5mZWUsXHJcbiAgICAgICAgX2ZlZTogTnVtYmVyKChhLmZlZSAqIDEwMCkudG9GaXhlZCg0KSksXHJcbiAgICAgICAgdG90YWxQcmljZTogTnVtYmVyKCh0b3RhbFByaWNlLnRvRml4ZWQoMikpKSxcclxuICAgICAgICBmZWVQcmljZTogTnVtYmVyKGZlZVByaWNlLnRvRml4ZWQoMikpXHJcbiAgICAgIH07XHJcbiAgICB9LFxyXG4gICAgd2VDaGF0KCkge1xyXG4gICAgICByZXR1cm4gdGhpcy5yZWNoYXJnZVNldHRpbmdzLndlQ2hhdDtcclxuICAgIH0sXHJcbiAgICBuZWVkUmVjaGFyZ2UoKSB7XHJcbiAgICAgIGNvbnN0IHt1c2VyTWFpblNjb3JlLCB0b3RhbE1vbmV5fSA9IHRoaXM7XHJcbiAgICAgIHJldHVybiB1c2VyTWFpblNjb3JlIC8gMTAwIDwgdG90YWxNb25leTtcclxuICAgIH0sXHJcbiAgfSxcclxuICBtZXRob2RzOiB7XHJcbiAgICBnZXRVcmw6IE5LQy5tZXRob2RzLnRvb2xzLmdldFVybCxcclxuICAgIHNlbGVjdFBheW1lbnQodHlwZSkge1xyXG4gICAgICB0aGlzLnBheW1lbnQgPSB0eXBlO1xyXG4gICAgfSxcclxuICAgIHN1Ym1pdCgpIHtcclxuICAgICAgY29uc3Qge3Bhc3N3b3JkLCBvcmRlcnNJZCwgdG90YWxNb25leX0gPSB0aGlzO1xyXG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgICAgUHJvbWlzZS5yZXNvbHZlKClcclxuICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICBpZighcGFzc3dvcmQpIHRocm93ICfor7fovpPlhaXnmbvlvZXlr4bnoIEnO1xyXG4gICAgICAgICAgcmV0dXJuIG5rY0FQSSgnL3Nob3AvcGF5JywgJ1BPU1QnLCB7XHJcbiAgICAgICAgICAgIG9yZGVyc0lkLFxyXG4gICAgICAgICAgICBwYXNzd29yZCxcclxuICAgICAgICAgICAgdG90YWxQcmljZTogdG90YWxNb25leVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICBzd2VldFN1Y2Nlc3MoJ+aUr+S7mOaIkOWKnycpO1xyXG4gICAgICAgICAgc2VsZi5wYXNzd29yZCA9ICcnO1xyXG4gICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgIE5LQy5tZXRob2RzLnZpc2l0VXJsKCcvc2hvcC9vcmRlcicpO1xyXG4gICAgICAgICAgfSwgMzAwMCk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuY2F0Y2goc3dlZXRFcnJvcik7XHJcbiAgICB9LFxyXG4gICAgdXNlQWxpUGF5KCkge1xyXG4gICAgICBjb25zdCB7b3JkZXJzSWQsIGFsaVBheX0gPSB0aGlzO1xyXG4gICAgICBjb25zdCB7dG90YWxQcmljZSwgZmVlUHJpY2V9ID0gYWxpUGF5O1xyXG4gICAgICBsZXQgbmV3V2luZG93ID0gd2luZG93Lm9wZW4oKTtcclxuICAgICAgUHJvbWlzZS5yZXNvbHZlKClcclxuICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICByZXR1cm4gbmtjQVBJKGAvc2hvcC9wYXkvYWxpcGF5P29yZGVyc0lkPSR7b3JkZXJzSWR9Jm1vbmV5PSR7dG90YWxQcmljZX1gLCAnR0VUJylcclxuICAgICAgICAgICAgLnRoZW4oZGF0YSA9PiB7XHJcbiAgICAgICAgICAgICAgaWYoTktDLmNvbmZpZ3MucGxhdGZvcm0gPT09ICdyZWFjdE5hdGl2ZScpIHtcclxuICAgICAgICAgICAgICAgIE5LQy5tZXRob2RzLnZpc2l0VXJsKGRhdGEuYWxpcGF5VXJsLCB0cnVlKTtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbmV3V2luZG93LmxvY2F0aW9uID0gZGF0YS5hbGlwYXlVcmw7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIHN3ZWV0SW5mbygn6K+35Zyo5rWP6KeI5Zmo5paw5omT5byA55qE56qX5Y+j5a6M5oiQ5pSv5LuY77yB6Iul5rKh5pyJ5paw56qX5Y+j5omT5byA77yM6K+35qOA5p+l5paw56qX5Y+j5piv5ZCm5bey6KKr5rWP6KeI5Zmo5oum5oiq44CCJyk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaChlcnIgPT4ge1xyXG4gICAgICAgICAgICAgIHN3ZWV0RXJyb3IoZXJyKTtcclxuICAgICAgICAgICAgICBpZihuZXdXaW5kb3cpIHtcclxuICAgICAgICAgICAgICAgIG5ld1dpbmRvdy5kb2N1bWVudC5ib2R5LmlubmVySFRNTCA9IGVyci5lcnJvciB8fCBlcnI7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KVxyXG4gICAgfVxyXG4gIH1cclxufSk7XHJcbiJdfQ==
