const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;


const userSchema = new Schema({
  kcb: {
    type: Number,
    default: 0
  },
  toc: {
    type: Date,
    default: Date.now
  },
  xsf: {
    type: Number,
    default: 0
  },
  tlv: {
    type: Date,
    default: Date.now,
  },
  disabledPostsCount: {
    type: Number,
    default: 0
  },
  disabledThreadsCount: {
    type: Number,
    default: 0
  },
  postCount: {
    type: Number,
    default: 0
  },
  threadCount: {
    type: Number,
    default: 0
  },
  subs: {
    type: Number,
    default: 0
  },
  recCount: {
    type: Number,
    default: 0
  },
  toppedThreadsCount: {
    type: Number,
    default: 0
  },
  digestThreadsCount: {
    type: Number,
    default: 0,
  },
  score: {
    default: 0,
    type: Number
  },
  lastVisitSelf: {
    type: Date,
    default: Date.now
  },
  username: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 30,
    unique: true
  },
  usernameLowerCase: {
    type: String,
    unique: true
  },
  uid: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  bday: String,
  cart: [String],
  email: {
    type: String,
    match: /.*@.*/
  },
  description: String,
  color: String,
  certs: {
    type: [String],
    index: 1
  },
  introText: String,
  postSign: String,
});
userSchema.pre('save', function(next) {
  if(!this.usernameLowerCase)
    this.usernameLowerCase = this.username.toLowerCase();
  next()
});
userSchema.methods.getUsersThreads = function() {
  return mongoose.connection.db.collection('threads').aggregate([
    {$match: {
      uid: this.uid,
      fid: {$not: {$eq: 'recycle'}}
    }},
    {$sort: {
      toc: -1
    }},
    {
      $limit: 8
    },
    {$lookup: {
      from: 'posts',
      localField: 'oc',
      foreignField: 'pid',
      as: 'oc'
    }},
    {$unwind: '$oc'},
    {$lookup: {
      from: 'forums',
      localField: 'fid',
      foreignField: 'fid',
      as: 'forum'
    }},
    {$unwind: '$forum'},
    {$lookup: {
      from: 'posts',
      localField: 'lm',
      foreignField: 'pid',
      as: 'lm'
    }},
    {$unwind: '$lm'},
    {$lookup: {
      from: 'users',
      localField: 'lm.uid',
      foreignField: 'uid',
      as: 'lm.user'
    }},
    {$unwind: '$lm.user'}
  ]).toArray()
};

module.exports = mongoose.model('users', userSchema);