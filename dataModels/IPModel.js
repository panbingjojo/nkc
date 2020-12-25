const mongoose = require('../settings/database');
const Schema = mongoose.Schema;
const schema = new Schema({
  _id: String,
  ip: {
    type: String,
    index: 1,
    default: ''
  },
  // 省份
  province: {
    type: String,
    default: ''
  },
  // 城市
  city: {
    type: String,
    default: ''
  },
  // 城市编码
  adCode: {
    type: String,
    default: ''
  },
  // 定位
  rectangle: {
    type: String,
    default: ''
  },
  // 更新时间
  tlm: {
    type: Date,
    default: Date.now,
    index: 1
  }
}, {
  collection: 'ips'
});

schema.statics.saveIPAndGetToken = async (ip) => {
  const SettingModel = mongoose.model('settings');
  const IPModel = mongoose.model('ips');
  ip = ip.trim();
  let oldData = await IPModel.findOne({ip});
  if(!oldData) {
    const _id = await SettingModel.newObjectId();
    oldData = IPModel({
      _id,
      ip,
    });
    await oldData.save();
  }
  return oldData._id;
}

schema.statics.getIPByToken = async (token) => {
  const IPModel = mongoose.model('ips');
  const data = await IPModel.findOne({_id: token.trim()});
  return data?data.ip:'';
}

schema.statics.getTokenByIP = async (ip) => {
  const IPModel = mongoose.model('ips');
  const data = await IPModel.findOne({ip: ip.trim()});
  return data?data._id: '';
};

schema.statics.getIPByTokens = async (tokens) => {
  const IPModel = mongoose.model('ips');
  const ips = await IPModel.find({_id: {$in: tokens}});
  const result = {};
  for(const i of ips) {
    result[i._id] = i.ip;
  }
  return result;
};

/*
* 通过ipToken获取ip信息
* @param {String} type 类型 ip，token
* @param {String} value type对应的值
* @return {Object}
*   @param {String} ip
*   @param {String} token
*   @param {String} location 位置信息
* @author pengxiguaa 2020-12-25
* */
schema.statics.getIPInfo = async (type, value) => {
  const IPModel = mongoose.model('ips');
  if(!['ip', '_id'].includes(type)) throwErr(500, `getIPInfo type类型错误`);
  const match = {};
  match[type] = value;
  const ipData = await IPModel.findOne(match);
  if(!ipData) throwErr(400, `未找到IP信息 ${JSON.stringify(match)}`);
  // 存在城市编码且时间未超过半年则无需调用ip信息查询接口
  if(ipData.adCode && ipData.tlm && ipData.tlm > (Date.now() - 180 * 24 * 60 * 60 * 1000)) {
    return {
      ip: ipData.ip,
      token: ipData._id,
      location: `${ipData.province} ${ipData.city}`
    };
  }
  const apiFunction = require('../nkcModules/apiFunction');
  let {
    province, city, adcode, rectangle
  } = await apiFunction.getIpAddress(ipData.ip);
  if(typeof adcode !== 'string') {
    province = '';
    city = '';
    adcode = '';
    rectangle = '';
  }
  await ipData.update({
    province,
    city,
    adCode: adcode,
    rectangle,
    tlm: Date.now()
  });
  return {
    ip: ipData.ip,
    token: ipData._id,
    location: (province && city)?`${province} ${city}`: '未知'
  };
};
schema.statics.getIPInfoByToken = async (token) => {
  const IPModel = mongoose.model('ips');
  return await IPModel.getIPInfo('_id', token);
};
/*
*
* */
schema.statics.getIPInfoByIP= async (ip) => {
  const IPModel = mongoose.model('ips');
  return await IPModel.getIPInfo('ip', ip);
};
module.exports = mongoose.model('ips', schema);
