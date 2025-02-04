const mongoose = require('../settings/database');
const Schema = mongoose.Schema;
const schema = new Schema({
  // 附件ID mongoose.Types.ObjectId().toString()
  _id: String,
  // 上传者ID
  uid: {
    type: String,
    default: '',
    index: 1,
  },
  // 附件类型 identityPictureA identityPictureB identityVideo
  type: {
    type: String,
    required: true,
    index: 1
  },
  // 创建时间
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  //文件处理状态
  // usable: 正常, useless: 处理失败，不可用, inProcess: 处理中
  state: {
    type: String,
    index: 1,
    default: 'usable'
  },
  // 文件处理错误时的错误信息
  errorInfo: {
    type: String,
    index: 1,
    default: ''
  },
  // 附件大小
  size: {
    type: Number,
    default: 0,
  },
  // 附件格式
  ext: {
    type: String,
    required: true,
    index: 1
  },
  // 附件原文件名
  name: {
    type: String,
    default: '',
  },
  // 附件hash
  hash: {
    type: String,
    index: 1,
    default: ''
  },
  files: { // 同 attachment.files
    def: Schema.Types.Mixed,
  }
}, {
  collection: 'verifiedUpload'
});


/*
* 获取新的附件ID
* @return {String} id
* */
schema.statics.getNewId = () => {
  return mongoose.Types.ObjectId().toString();
};


schema.statics.saveIdentityInfo = async (uid, file, type) => {
  const VerifiedUploadModel = mongoose.model('verifiedUpload');
  const FILE = require('../nkcModules/file');
  const vid = await VerifiedUploadModel.getNewId();
  let extensions;
  if(type === 'identityVideo') {
    extensions = FILE.videoExtensions;
  } else {
    extensions = ['jpg', 'jpeg', 'png'];
  }
  const ext = await FILE.getFileExtension(file, extensions);
  const time = new Date();
  const data = await VerifiedUploadModel.createDataAndPushFile({
    vid,
    time,
    ext,
    file,
    uid,
    sizeLimit: 300 * 1024 * 1024,
    type,
  });
  return data._id;
}

schema.statics.createDataAndPushFile = async props => {
  const {
    file,
    vid,
    uid,
    type,
    sizeLimit = 0,
    ext,
    time
  } = props;
  const VerifiedUploadModel = mongoose.model('verifiedUpload');
  const {getSize} = require('../nkcModules/tools');
  // if(file.size > sizeLimit) throwErr(400, `文件不能超过 ${getSize(sizeLimit, 0)}`);
  const verifiedUpload = VerifiedUploadModel({
    _id: vid,
    toc: time,
    size: file.size,
    name: file.name,
    hash: file.hash,
    ext,
    type,
    uid,
    state: 'inProcess',
  });
  await verifiedUpload.save();
  verifiedUpload.pushToMediaService(file.path)
    .catch(err => {
      VerifiedUploadModel.updateResourceStatus({
        rid,
        status: false,
        error: err.message
      });
    })
  return verifiedUpload;
};

schema.methods.pushToMediaService = async function(filePath) {
  const FILE = require('../nkcModules/file');
  const socket = require('../nkcModules/socket');
  const mediaClient = require('../tools/mediaClient');
  const {toc, type, _id, ext, name} = this;
  const storeServiceUrl = await FILE.getStoreUrl(toc);
  const mediaServiceUrl = await socket.getMediaServiceUrl();
  const timePath = await FILE.getTimePath(toc);
  const mediaPath = await FILE.getMediaPath(type);
  const data = {
    vid: _id,
    timePath,
    mediaPath,
    toc,
    ext,
    type,
    disposition: name,
  };
  const res = await mediaClient(mediaServiceUrl, {
    type,
    filePath,
    storeUrl: storeServiceUrl,
    data
  });
  return res.files;
};

schema.methods.getRemoteFile = async function(size = 'def') {
  const FILE = require('../nkcModules/file');
  const {_id, toc, type, name, files, ext} = this;
  return await FILE.getRemoteFile({
    id: _id,
    ext,
    toc,
    type,
    name,
    file: files[size] || files['def']
  });
}

schema.methods.updateFilesInfo = async function() {
  const FILE = require('../nkcModules/file');
  const {toc, type, _id, ext} = this;
  let filenames;
  if(type === 'identityVideo') {
    filenames = {
      def: `${_id}.mp4`
    };
  } else {
    filenames = {
      def: `${_id}.${ext}`
    }
  }
  const files = await FILE.getStoreFilesInfoObj(toc, type, filenames);
  await this.updateOne({
    $set: {
      files
    }
  });
};

/*
* 更新身份认证文件处理超时状态
* @author panbing 2021/12/03
* */
schema.statics.updateVerifiedUpdateState = async () => {
  const VerifiedUpdate = mongoose.model('verifiedUpload');
  const time = Date.now() - 12*60*60*1000;
  await VerifiedUpdate.updateMany({
    toc: {$lte: time},
    state: 'inProcess'
  }, {
    $set: {
      state: 'useless'
    }
  });
}

/*
* 修改身份认证文件处理状态
* */
schema.statics.updateVerifiedState = async (props) => {
  const {vid, status, error, fileInfo = {}} = props;
  const VerifiedUploadModel = mongoose.model('verifiedUpload');
  const UsersPersonalModel = mongoose.model('usersPersonal');
  const verifiedUpload = await VerifiedUploadModel.findOne({_id: vid}).sort({toc: -1});
  const userPersonal = await UsersPersonalModel.findOne({uid: verifiedUpload.uid});
  let verifiedUploadState;
  let errorInfo;

  if(status) {
    // 文件处理成功
    verifiedUploadState = 'usable';
    errorInfo = '';
  } else {
    // 文件处理失败
    verifiedUploadState = 'useless';
    errorInfo = error;
    if(verifiedUpload.type === 'identityVideo') {
      await userPersonal.updateOne({
        $set: {
          'authenticate.video.status': 'useless',
        }
      });
    } else {
      await userPersonal.updateOne({
        $set: {
          'authenticate.card.status': 'useless',
        }
      });
    }
  }
  await verifiedUpload.updateOne({
    $set: {
      errorInfo,
      state: verifiedUploadState,
      files: fileInfo,
    }
  });
}

module.exports = mongoose.model('verifiedUpload', schema);
