var data = NKC.methods.getDataById("data");
var pid = [];
var did = [];
var review = {};
var reviewType = data.reviewType;
for(var i = 0; i < data.results.length; i++) {
  if(['thread', 'post'].includes(data.results[i].type)) {
    var p = data.results[i].post.pid;
    var tid = data.results[i].thread.tid;
    var isThread = data.results[i].thread.oc === p;
    pid.push(p);
    review[p] = {
      pid: p,
      pass: true,
      reason: "",
      delType: "toDraft",
      isThread: isThread,
      noticeType: [true],
      illegalType: [],
      threadId: tid
    };
  } else if(data.results[i].type === 'document') {
    let d = data.results[i].document.did;
    let documentId = data.results[i].document._id;
    let source = data.results[i].document.source;
    let aid = data.results[i].content._id;
    did.push(documentId);
    review[documentId] = {
      documentId: documentId,
      did: d,
      pass: true,
      reason: "",
      delType: source !== 'moment'?"faulty":"deleted",
      noticeType: [true],
      illegalType: false,
      articleId: aid,
      resetPostCount: '',
    };
  }
}

var app = new Vue({
  el: "#app",
  data: {
    selectedPid:[],
    selectedDid: [],
    showInputPid: [],
    pid: pid,
    did: did,
    review: review,
  },
  mounted() {
  },
  methods: {
    selectAll: function() {
      if(this.selectedPid.length === this.pid.length) {
        this.selectedPid = []
      } else {
        this.selectedPid = [].concat(this.pid);
      }
      if(this.selectedDid.length === this.did.length) {
        this.selectedDid = []
      } else {
        this.selectedDid = [].concat(this.did);
      }
    },
    //提交document审核
    document(arr, index) {
      let data = arr[index];
      if(!data) return;
      let d, url, method = "PUT";
      if(data.pass) {
        d = {
          pass: data.pass,
          docId: data.documentId,
          type: 'document',
        };
        url = "/review";
      } else {
        d = {
          type: 'document',
          pass: data.pass,
          docId: data.documentId,
          did: [data.did],
          reason: data.reason,
          delType: data.delType,
          remindUser: data.noticeType,
          violation: data.illegalType
        };
        method = "PUT";
        url = "/review";
      }
      nkcAPI(url, method, d)
        .then(function() {
          screenTopAlert("DocumentId: " + data.documentId + " 处理成功!");
          app.document(arr, index+1);
        })
        .catch(function(data) {
          screenTopWarning("DocumentId: " + data.documentId + ' 处理失败! error: ' + data.error || data);
          app.document(arr, index+1);
        });
    },
    //提交post审核
    post: function(arr, index) {
      let data = arr[index];
      if(!data) return;
      let d, url, method = "PUT";
      if(data.pass) {
        // 通过
        d = {
          pid: data.postId,
          type: 'post',
        };
        url = "/review";
      } else {
        // 不通过
        // 送回收站
        if(data.delType === "toRecycle") {
          /*d = {
            fid: "recycle",
            para: data
          };*/
          d = {
            postsId: [data.postId],
            reason: data.reason,
            remindUser: data.noticeType,
            violation: data.illegalType,//是否违规
          };
          method = "POST";
          // url = "/t/" + data.threadId + "/disabled";
          url = "/threads/recycle";
        } else {
          //退修
          /*d = {
            para: data
          };*/
          d = {
            postsId: [data.postId],
            reason: data.reason,
            remindUser: data.noticeType,
            violation: data.illegalType
          };
          // url = "/t/" + data.threadId + "/moveDraft";
          url = "/threads/draft";
          method = "POST";
        }
      }

      return nkcAPI(url, method, d)
        .then(function() {
          screenTopAlert("PID: " + data.postId + " 处理成功!");
          app.post(arr, index+1);
        })
        .catch(function(data) {
          screenTopWarning("PID: " + data.postId + ' 处理失败! error: ' + data.error || data);
          console.log(data);
          app.post(arr, index+1);
        });
    },
    submit: function(id, type) {
      const self = this;
      Promise.resolve()
        .then(() => {
          if(self.selectedPid.length !== 0 || (id && type === 'post')) {
            let pidArr;
            if(typeof id === "string") { // 提交单个
              pidArr = [id];
            } else { // 提交多个
              pidArr = self.selectedPid;
            }
            let arr = [];
            for(let i = 0; i < pidArr.length; i++) {
              let reviewData = self.review[pidArr[i]];
              arr.push({
                pass: reviewData.pass,
                reason: reviewData.reason,
                delType: reviewData.delType,
                postType: reviewData.isThread?"thread":"post",
                threadId: reviewData.threadId,
                postId: reviewData.pid,
                noticeType: reviewData.noticeType.length > 0,
                illegalType: reviewData.illegalType.length > 0
              });
            }
            return self.post(arr, 0);
          }
          return;
        })
        .then(() => {
          if(self.selectedDid.length !== 0 || (id && type === 'document')) {
            let didArr;
            if(typeof id === "string") {//提交单个
              didArr = [id];
            } else {
              didArr = self.selectedDid;
            }
            let arr = [];
            for(let i = 0; i < didArr.length; i++) {
              let reviewData = self.review[didArr[i]];
              arr.push({
                documentId: reviewData.documentId,
                did: reviewData.did,
                pass: reviewData.pass,
                reason: reviewData.reason,
                delType: reviewData.delType,
                articleId: reviewData.articleId,
                noticeType: reviewData.noticeType.length > 0,
                illegalType: reviewData.illegalType.length > 0
              });
            }
            self.document(arr, 0);
          }
        })
        .catch((err) => {
          sweetError(err);
        })
    },
    chooseAll: function(type) {
      for(var i = 0; i < this.selectedPid.length; i++) {
        var p = this.selectedPid[i];
        var reviewData = this.review[p];
        reviewData.pass = type;
      }
      for(var i = 0; i < this.selectedDid.length; i++) {
        var d = this.selectedDid[i];
        var reviewData = this.review[d];
        reviewData.pass = type;
      }
    },
    //选择审核类型
    selectReviewType(type) {
      window.location.href = `/review?reviewType=${type}`;
    }
  }
});

Object.assign(window, {
  pid,
  review,
  app,
});
