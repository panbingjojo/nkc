const Cookies = require('cookies-string-parse');
const cookieConfig = require('../config/cookie');
function getCookieInfo(cookie = '', key) {
  let keyInfo = null;
  try{
    const cookies = new Cookies(cookie, {
      keys: [cookieConfig.secret]
    });
    let result = cookies.get(key, {
      signed: true,

    });
    if(result) {
      keyInfo = result;
    }
  } catch(err) {
    if(global.NKC.isDevelopment) {
      console.error(err);
    }
  }
  return keyInfo;
}


function getUserInfo(cookie) {
  let userInfo = null;
  try{
    let result = getCookieInfo(cookie, 'userInfo');
    if(result) {
      result = Buffer.from(result, 'base64').toString();
      userInfo = JSON.parse(result);
    }
  } catch(err) {
    if(global.NKC.isDevelopment) {
      console.error(err);
    }
  }
  return userInfo;
}

module.exports = {
  getCookieInfo,
  getUserInfo
}