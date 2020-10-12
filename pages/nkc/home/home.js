(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var data = NKC.methods.getDataById("data");

var modifyAd = function modifyAd(ad, type) {
  ad.type = type;
};

for (var i = 0; i < data.ads.movable.length; i++) {
  var ad = data.ads.movable[i];
  modifyAd(ad, "movable");
}

for (var _i = 0; _i < data.ads.fixed.length; _i++) {
  var _ad = data.ads.fixed[_i];
  modifyAd(_ad, "fixed");
}

var app = new Vue({
  el: "#app",
  data: {
    page: {
      id: 'other',
      name: '其他'
    },
    recommendThreads: data.recommendThreads,
    ads: data.ads,
    recommendForums: data.recommendForums,
    columns: data.columns,
    goods: data.goods,
    toppedThreads: data.toppedThreads,
    latestToppedThreads: data.latestToppedThreads,
    showShopGoods: data.showGoods ? "t" : "",
    // 首页“最新原创”文章条目显示模式，为空就默认为简略显示
    originalThreadDisplayMode: data.originalThreadDisplayMode,
    // 是否在首页显示“活动”入口
    showActivityEnter: data.showActivityEnter ? "show" : "hidden",
    updating: false
  },
  mounted: function mounted() {
    window.SelectImage = new NKC.methods.selectImage();
    window.MoveThread = new NKC.modules.MoveThread();
  },
  computed: {
    selectedRecommendForumsId: function selectedRecommendForumsId() {
      return data.recommendForums.map(function (f) {
        return f.fid;
      });
    },
    nav: function nav() {
      var page = this.page;
      var arr = [{
        id: 'other',
        name: '其他'
      }, {
        id: 'movable',
        name: '轮播图'
      }, {
        id: 'fixed',
        name: '固定图'
      }];
      arr.map(function (a) {
        a.active = a.id === page.id;
      });
      return arr;
    }
  },
  methods: {
    checkString: NKC.methods.checkData.checkString,
    checkNumber: NKC.methods.checkData.checkNumber,
    getUrl: NKC.methods.tools.getUrl,
    floatUserInfo: NKC.methods.tools.floatUserInfo,
    visitUrl: NKC.methods.visitUrl,
    removeFromArr: function removeFromArr(arr, index) {
      arr.splice(index, 1);
    },
    moveFromArr: function moveFromArr(arr, index, type) {
      var count = arr.length;
      if (index === 0 && type === 'left') return;
      if (index + 1 === count && type === 'right') return;

      var _index;

      if (type === 'left') {
        _index = index - 1;
      } else {
        _index = index + 1;
      }

      var item = arr[index];
      var _item = arr[_index];
      Vue.set(arr, index, _item);
      Vue.set(arr, _index, item);
    },
    getRecommendTypeName: function getRecommendTypeName(id) {
      return {
        movable: '轮播图',
        fixed: '固定图'
      }[id];
    },
    selectPage: function selectPage(page) {
      this.page = page;
    },
    saveRecommendThreads: function saveRecommendThreads() {
      var page = this.page;
      var options = this.recommendThreads[page.id];
      nkcAPI("/nkc/home", 'PUT', {
        operation: 'saveRecommendThreads',
        type: page.id,
        options: options
      }).then(function () {
        sweetSuccess('保存成功');
      })["catch"](sweetError);
    },
    updateThreadList: function updateThreadList() {
      var page = this.page;
      this.updating = true;
      var pageId = page.id;
      var self = this;
      nkcAPI('/nkc/home', 'PUT', {
        operation: 'updateThreadList',
        type: pageId
      }).then(function (data) {
        self.recommendThreads[pageId].automaticallySelectedThreads = data.automaticallySelectedThreads;
        Vue.set(self.saveRecommendThreads);
        sweetSuccess('更新成功');
        self.updating = false;
      })["catch"](function (err) {
        self.updating = false;
      });
    },
    selectLocalFile: function selectLocalFile(ad) {
      var options = {};

      if (ad.type === "movable") {
        options.aspectRatio = 800 / 336;
      } else {
        options.aspectRatio = 400 / 253;
      }

      SelectImage.show(function (data) {
        var formData = new FormData();
        formData.append("cover", data);
        formData.append("topType", ad.type);
        formData.append("tid", ad.tid);
        nkcUploadFile("/nkc/home", "POST", formData).then(function (data) {
          ad.cover = data.coverHash;
          console.log(ad.cover);
        })["catch"](sweetError);
        SelectImage.close();
      }, options);
    },
    move: function move(ad, type) {
      var ads;

      if (ad.type === "movable") {
        ads = this.ads.movable;
      } else {
        ads = this.ads.fixed;
      }

      var index = ads.indexOf(ad);
      if (type === "left" && index === 0 || type === "right" && index + 1 === ads.length) return;
      var newIndex;

      if (type === "left") {
        newIndex = index - 1;
      } else {
        newIndex = index + 1;
      }

      var otherAd = ads[newIndex];
      ads.splice(index, 1, otherAd);
      ads.splice(newIndex, 1, ad);
    },
    saveAds: function saveAds() {
      var _this$ads = this.ads,
          movable = _this$ads.movable,
          fixed = _this$ads.fixed,
          movableOrder = _this$ads.movableOrder,
          fixedOrder = _this$ads.fixedOrder;
      var self = this;
      Promise.resolve().then(function () {
        movable.concat(fixed).map(function (ad) {
          self.checkString(ad.title, {
            name: "标题",
            minLength: 1,
            maxLength: 200
          });
          if (!ad.cover) throw "封面图不能为空";
          if (!ad.tid) throw "文章ID不能为空";
        });
        return nkcAPI("/nkc/home", "PUT", {
          operation: "saveAds",
          movable: movable,
          fixed: fixed,
          movableOrder: movableOrder,
          fixedOrder: fixedOrder
        });
      }).then(function () {
        sweetSuccess("保存成功");
      })["catch"](sweetError);
    },
    remove: function remove(ads, index) {
      ads.splice(index, 1);
      /*sweetQuestion("确定要执行删除操作？")
        .then(() => {
          ads.splice(index, 1)
        })
        .catch(() => {})*/
    },
    addForum: function addForum() {
      var self = this;
      MoveThread.open(function (data) {
        var originForums = data.originForums;
        originForums.map(function (forum) {
          if (!self.selectedRecommendForumsId.includes(forum.fid)) {
            self.recommendForums.push(forum);
          }
        });
        MoveThread.close();
      }, {
        hideMoveType: true
      });
    },
    moveForum: function moveForum(arr, f, type) {
      var index = arr.indexOf(f);
      if (type === "left" && index === 0 || type === "right" && index + 1 === arr.length) return;
      var newIndex;

      if (type === "left") {
        newIndex = index - 1;
      } else {
        newIndex = index + 1;
      }

      var otherAd = arr[newIndex];
      arr.splice(index, 1, otherAd);
      arr.splice(newIndex, 1, f);
    },
    removeForum: function removeForum(arr, index) {
      arr.splice(index, 1);
      /*const self = this;
      sweetQuestion("确定要执行删除操作？")
        .then(() => {
          arr.splice(index, 1);
        })
        .catch(() => {})*/
    },
    saveRecommendForums: function saveRecommendForums() {
      var forumsId = this.recommendForums.map(function (forum) {
        return forum.fid;
      });
      nkcAPI("/nkc/home", "PUT", {
        operation: "saveRecommendForums",
        forumsId: forumsId
      }).then(function () {
        sweetSuccess("保存成功");
      })["catch"](sweetError);
    },
    saveColumns: function saveColumns() {
      var columnsId = this.columns.map(function (c) {
        return c._id;
      });
      nkcAPI("/nkc/home", "PUT", {
        operation: "saveColumns",
        columnsId: columnsId
      }).then(function () {
        sweetSuccess("保存成功");
      })["catch"](sweetError);
    },
    saveGoods: function saveGoods() {
      var goodsId = this.goods.map(function (g) {
        return g.productId;
      });
      var showShopGoods = !!this.showShopGoods;
      nkcAPI("/nkc/home", "PUT", {
        operation: "saveGoods",
        goodsId: goodsId,
        showShopGoods: showShopGoods
      }).then(function () {
        sweetSuccess("保存成功");
      })["catch"](sweetError);
    },
    saveToppedThreads: function saveToppedThreads() {
      var toppedThreadsId = this.toppedThreads.map(function (t) {
        return t.tid;
      });
      var latestToppedThreadsId = this.latestToppedThreads.map(function (t) {
        return t.tid;
      });
      nkcAPI("/nkc/home", "PUT", {
        operation: "saveToppedThreads",
        toppedThreadsId: toppedThreadsId,
        latestToppedThreadsId: latestToppedThreadsId
      }).then(function () {
        sweetSuccess("保存成功");
      })["catch"](sweetError);
    },
    saveOriginalThreadDisplayMode: function saveOriginalThreadDisplayMode() {
      var originalThreadDisplayMode = this.originalThreadDisplayMode;
      nkcAPI("/nkc/home", "PUT", {
        operation: "saveOriginalThreadDisplayMode",
        originalThreadDisplayMode: originalThreadDisplayMode
      }).then(function () {
        sweetSuccess("保存成功");
      })["catch"](sweetError);
    },
    saveShowActivityEnter: function saveShowActivityEnter() {
      var value = this.showActivityEnter === "show";
      nkcAPI("/nkc/home/showActivityEnter", "PUT", {
        showActivityEnter: value
      }).then(function () {
        sweetSuccess("保存成功");
      })["catch"](sweetError);
    }
  }
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9ua2MvaG9tZS9ob21lLm1qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsSUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLE9BQUosQ0FBWSxXQUFaLENBQXdCLE1BQXhCLENBQWI7O0FBQ0EsSUFBTSxRQUFRLEdBQUcsU0FBWCxRQUFXLENBQUMsRUFBRCxFQUFLLElBQUwsRUFBYztBQUM3QixFQUFBLEVBQUUsQ0FBQyxJQUFILEdBQVUsSUFBVjtBQUNELENBRkQ7O0FBSUEsS0FBSSxJQUFJLENBQUMsR0FBRyxDQUFaLEVBQWUsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFMLENBQVMsT0FBVCxDQUFpQixNQUFwQyxFQUE0QyxDQUFDLEVBQTdDLEVBQWlEO0FBQy9DLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFMLENBQVMsT0FBVCxDQUFpQixDQUFqQixDQUFYO0FBQ0EsRUFBQSxRQUFRLENBQUMsRUFBRCxFQUFLLFNBQUwsQ0FBUjtBQUNEOztBQUVELEtBQUksSUFBSSxFQUFDLEdBQUcsQ0FBWixFQUFlLEVBQUMsR0FBRyxJQUFJLENBQUMsR0FBTCxDQUFTLEtBQVQsQ0FBZSxNQUFsQyxFQUEwQyxFQUFDLEVBQTNDLEVBQStDO0FBQzdDLE1BQU0sR0FBRSxHQUFHLElBQUksQ0FBQyxHQUFMLENBQVMsS0FBVCxDQUFlLEVBQWYsQ0FBWDtBQUNBLEVBQUEsUUFBUSxDQUFDLEdBQUQsRUFBSyxPQUFMLENBQVI7QUFDRDs7QUFFRCxJQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUosQ0FBUTtBQUNsQixFQUFBLEVBQUUsRUFBRSxNQURjO0FBRWxCLEVBQUEsSUFBSSxFQUFFO0FBQ0osSUFBQSxJQUFJLEVBQUU7QUFBQyxNQUFBLEVBQUUsRUFBRSxPQUFMO0FBQWMsTUFBQSxJQUFJLEVBQUU7QUFBcEIsS0FERjtBQUVKLElBQUEsZ0JBQWdCLEVBQUUsSUFBSSxDQUFD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TUFBQSxNQUFNLENBQUMsV0FBRCxFQUFjLEtBQWQsRUFBcUI7QUFDekIsUUFBQSxTQUFTLEVBQUUsK0JBRGM7QUFFekIsUUFBQSx5QkFBeUIsRUFBekI7QUFGeUIsT0FBckIsQ0FBTixDQUlHLElBSkgsQ0FJUSxZQUFNO0FBQ1YsUUFBQSxZQUFZLENBQUMsTUFBRCxDQUFaO0FBQ0QsT0FOSCxXQU9TLFVBUFQ7QUFRRCxLQTNPTTtBQTRPUCxJQUFBLHFCQTVPTyxtQ0E0T2lCO0FBQ3RCLFVBQUksS0FBSyxHQUFHLEtBQUssaUJBQUwsS0FBMkIsTUFBdkM7QUFDQSxNQUFBLE1BQU0sQ0FBQyw2QkFBRCxFQUFnQyxLQUFoQyxFQUF1QztBQUMzQyxRQUFBLGlCQUFpQixFQUFFO0FBRHdCLE9BQXZDLENBQU4sQ0FHQyxJQUhELENBR00sWUFBTTtBQUNWLFFBQUEsWUFBWSxDQUFDLE1BQUQsQ0FBWjtBQUNELE9BTEQsV0FNTyxVQU5QO0FBT0Q7QUFyUE07QUFoRFMsQ0FBUixDQUFaIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY29uc3QgZGF0YSA9IE5LQy5tZXRob2RzLmdldERhdGFCeUlkKFwiZGF0YVwiKTtcclxuY29uc3QgbW9kaWZ5QWQgPSAoYWQsIHR5cGUpID0+IHtcclxuICBhZC50eXBlID0gdHlwZTtcclxufTtcclxuXHJcbmZvcihsZXQgaSA9IDA7IGkgPCBkYXRhLmFkcy5tb3ZhYmxlLmxlbmd0aDsgaSsrKSB7XHJcbiAgY29uc3QgYWQgPSBkYXRhLmFkcy5tb3ZhYmxlW2ldO1xyXG4gIG1vZGlmeUFkKGFkLCBcIm1vdmFibGVcIik7XHJcbn1cclxuXHJcbmZvcihsZXQgaSA9IDA7IGkgPCBkYXRhLmFkcy5maXhlZC5sZW5ndGg7IGkrKykge1xyXG4gIGNvbnN0IGFkID0gZGF0YS5hZHMuZml4ZWRbaV07XHJcbiAgbW9kaWZ5QWQoYWQsIFwiZml4ZWRcIik7XHJcbn1cclxuXHJcbmNvbnN0IGFwcCA9IG5ldyBWdWUoe1xyXG4gIGVsOiBcIiNhcHBcIixcclxuICBkYXRhOiB7XHJcbiAgICBwYWdlOiB7aWQ6ICdvdGhlcicsIG5hbWU6ICflhbbku5YnfSxcclxuICAgIHJlY29tbWVuZFRocmVhZHM6IGRhdGEucmVjb21tZW5kVGhyZWFkcyxcclxuICAgIGFkczogZGF0YS5hZHMsXHJcbiAgICByZWNvbW1lbmRGb3J1bXM6IGRhdGEucmVjb21tZW5kRm9ydW1zLFxyXG4gICAgY29sdW1uczogZGF0YS5jb2x1bW5zLFxyXG4gICAgZ29vZHM6IGRhdGEuZ29vZHMsXHJcbiAgICB0b3BwZWRUaHJlYWRzOiBkYXRhLnRvcHBlZFRocmVhZHMsXHJcbiAgICBsYXRlc3RUb3BwZWRUaHJlYWRzOiBkYXRhLmxhdGVzdFRvcHBlZFRocmVhZHMsXHJcbiAgICBzaG93U2hvcEdvb2RzOiAoZGF0YS5zaG93R29vZHM/IFwidFwiOiBcIlwiKSxcclxuICAgIC8vIOmmlumhteKAnOacgOaWsOWOn+WIm+KAneaWh+eroOadoeebruaYvuekuuaooeW8j++8jOS4uuepuuWwsem7mOiupOS4uueugOeVpeaYvuekulxyXG4gICAgb3JpZ2luYWxUaHJlYWREaXNwbGF5TW9kZTogZGF0YS5vcmlnaW5hbFRocmVhZERpc3BsYXlNb2RlLFxyXG4gICAgLy8g5piv5ZCm5Zyo6aaW6aG15pi+56S64oCc5rS75Yqo4oCd5YWl5Y+jXHJcbiAgICBzaG93QWN0aXZpdHlFbnRlcjogZGF0YS5zaG93QWN0aXZpdHlFbnRlciA/IFwic2hvd1wiIDogXCJoaWRkZW5cIixcclxuICAgIHVwZGF0aW5nOiBmYWxzZSxcclxuICB9LFxyXG4gIG1vdW50ZWQoKSB7XHJcbiAgICB3aW5kb3cuU2VsZWN0SW1hZ2UgPSBuZXcgTktDLm1ldGhvZHMuc2VsZWN0SW1hZ2UoKTtcclxuICAgIHdpbmRvdy5Nb3ZlVGhyZWFkID0gbmV3IE5LQy5tb2R1bGVzLk1vdmVUaHJlYWQoKTtcclxuICB9LFxyXG4gIGNvbXB1dGVkOiB7XHJcbiAgICBzZWxlY3RlZFJlY29tbWVuZEZvcnVtc0lkKCkge1xyXG4gICAgICByZXR1cm4gZGF0YS5yZWNvbW1lbmRGb3J1bXMubWFwKGYgPT4gZi5maWQpO1xyXG4gICAgfSxcclxuICAgIG5hdigpIHtcclxuICAgICAgY29uc3Qge3BhZ2V9ID0gdGhpcztcclxuICAgICAgY29uc3QgYXJyID0gW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgIGlkOiAnb3RoZXInLFxyXG4gICAgICAgICAgbmFtZTogJ+WFtuS7lidcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGlkOiAnbW92YWJsZScsXHJcbiAgICAgICAgICBuYW1lOiAn6L2u5pKt5Zu+J1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgaWQ6ICdmaXhlZCcsXHJcbiAgICAgICAgICBuYW1lOiAn5Zu65a6a5Zu+J1xyXG4gICAgICAgIH1cclxuICAgICAgXTtcclxuICAgICAgYXJyLm1hcChhID0+IHtcclxuICAgICAgICBhLmFjdGl2ZSA9IGEuaWQgPT09IHBhZ2UuaWQ7XHJcbiAgICAgIH0pO1xyXG4gICAgICByZXR1cm4gYXJyO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgbWV0aG9kczoge1xyXG4gICAgY2hlY2tTdHJpbmc6IE5LQy5tZXRob2RzLmNoZWNrRGF0YS5jaGVja1N0cmluZyxcclxuICAgIGNoZWNrTnVtYmVyOiBOS0MubWV0aG9kcy5jaGVja0RhdGEuY2hlY2tOdW1iZXIsXHJcbiAgICBnZXRVcmw6IE5LQy5tZXRob2RzLnRvb2xzLmdldFVybCxcclxuICAgIGZsb2F0VXNlckluZm86IE5LQy5tZXRob2RzLnRvb2xzLmZsb2F0VXNlckluZm8sXHJcbiAgICB2aXNpdFVybDogTktDLm1ldGhvZHMudmlzaXRVcmwsXHJcbiAgICByZW1vdmVGcm9tQXJyKGFyciwgaW5kZXgpIHtcclxuICAgICAgYXJyLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICB9LFxyXG4gICAgbW92ZUZyb21BcnIoYXJyLCBpbmRleCwgdHlwZSkge1xyXG4gICAgICBjb25zdCBjb3VudCA9IGFyci5sZW5ndGg7XHJcbiAgICAgIGlmKGluZGV4ID09PSAwICYmIHR5cGUgPT09ICdsZWZ0JykgcmV0dXJuO1xyXG4gICAgICBpZihpbmRleCArIDEgPT09IGNvdW50ICYmIHR5cGUgPT09ICdyaWdodCcpIHJldHVybjtcclxuICAgICAgbGV0IF9pbmRleDtcclxuICAgICAgaWYodHlwZSA9PT0gJ2xlZnQnKSB7XHJcbiAgICAgICAgX2luZGV4ID0gaW5kZXggLSAxO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIF9pbmRleCA9IGluZGV4ICsgMTtcclxuICAgICAgfVxyXG4gICAgICBjb25zdCBpdGVtID0gYXJyW2luZGV4XTtcclxuICAgICAgY29uc3QgX2l0ZW0gPSBhcnJbX2luZGV4XTtcclxuICAgICAgVnVlLnNldChhcnIsIGluZGV4LCBfaXRlbSk7XHJcbiAgICAgIFZ1ZS5zZXQoYXJyLCBfaW5kZXgsIGl0ZW0pO1xyXG4gICAgfSxcclxuICAgIGdldFJlY29tbWVuZFR5cGVOYW1lKGlkKSB7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgbW92YWJsZTogJ+i9ruaSreWbvicsXHJcbiAgICAgICAgZml4ZWQ6ICflm7rlrprlm74nXHJcbiAgICAgIH1baWRdXHJcbiAgICB9LFxyXG4gICAgc2VsZWN0UGFnZShwYWdlKSB7XHJcbiAgICAgIHRoaXMucGFnZSA9IHBhZ2U7XHJcbiAgICB9LFxyXG4gICAgc2F2ZVJlY29tbWVuZFRocmVhZHMoKSB7XHJcbiAgICAgIGNvbnN0IHtwYWdlfSA9IHRoaXM7XHJcbiAgICAgIGNvbnN0IG9wdGlvbnMgPSB0aGlzLnJlY29tbWVuZFRocmVhZHNbcGFnZS5pZF07XHJcbiAgICAgIG5rY0FQSShgL25rYy9ob21lYCwgJ1BVVCcsIHtcclxuICAgICAgICBvcGVyYXRpb246ICdzYXZlUmVjb21tZW5kVGhyZWFkcycsXHJcbiAgICAgICAgdHlwZTogcGFnZS5pZCxcclxuICAgICAgICBvcHRpb25zXHJcbiAgICAgIH0pXHJcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgc3dlZXRTdWNjZXNzKCfkv53lrZjmiJDlip8nKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaChzd2VldEVycm9yKTtcclxuICAgIH0sXHJcbiAgICB1cGRhdGVUaHJlYWRMaXN0KCkge1xyXG4gICAgICBjb25zdCB7cGFnZX0gPSB0aGlzO1xyXG4gICAgICB0aGlzLnVwZGF0aW5nID0gdHJ1ZTtcclxuICAgICAgY29uc3QgcGFnZUlkID0gcGFnZS5pZDtcclxuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICAgIG5rY0FQSSgnL25rYy9ob21lJywgJ1BVVCcsIHtcclxuICAgICAgICBvcGVyYXRpb246ICd1cGRhdGVUaHJlYWRMaXN0JyxcclxuICAgICAgICB0eXBlOiBwYWdlSWRcclxuICAgICAgfSlcclxuICAgICAgICAudGhlbihkYXRhID0+IHtcclxuICAgICAgICAgIHNlbGYucmVjb21tZW5kVGhyZWFkc1twYWdlSWRdLmF1dG9tYXRpY2FsbHlTZWxlY3RlZFRocmVhZHMgPSBkYXRhLmF1dG9tYXRpY2FsbHlTZWxlY3RlZFRocmVhZHM7XHJcbiAgICAgICAgICBWdWUuc2V0KHNlbGYuc2F2ZVJlY29tbWVuZFRocmVhZHMpO1xyXG4gICAgICAgICAgc3dlZXRTdWNjZXNzKCfmm7TmlrDmiJDlip8nKTtcclxuICAgICAgICAgIHNlbGYudXBkYXRpbmcgPSBmYWxzZTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaChlcnIgPT4ge1xyXG4gICAgICAgICAgc2VsZi51cGRhdGluZyA9IGZhbHNlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIHNlbGVjdExvY2FsRmlsZShhZCkge1xyXG4gICAgICBjb25zdCBvcHRpb25zID0ge307XHJcbiAgICAgIGlmKGFkLnR5cGUgPT09IFwibW92YWJsZVwiKSB7XHJcbiAgICAgICAgb3B0aW9ucy5hc3BlY3RSYXRpbyA9IDgwMC8zMzY7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgb3B0aW9ucy5hc3BlY3RSYXRpbyA9IDQwMC8yNTM7XHJcbiAgICAgIH1cclxuICAgICAgU2VsZWN0SW1hZ2Uuc2hvdyhkYXRhID0+IHtcclxuICAgICAgICBjb25zdCBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xyXG4gICAgICAgIGZvcm1EYXRhLmFwcGVuZChcImNvdmVyXCIsIGRhdGEpO1xyXG4gICAgICAgIGZvcm1EYXRhLmFwcGVuZChcInRvcFR5cGVcIiwgYWQudHlwZSk7XHJcbiAgICAgICAgZm9ybURhdGEuYXBwZW5kKFwidGlkXCIsIGFkLnRpZCk7XHJcbiAgICAgICAgbmtjVXBsb2FkRmlsZShcIi9ua2MvaG9tZVwiLCBcIlBPU1RcIiwgZm9ybURhdGEpXHJcbiAgICAgICAgICAudGhlbihkYXRhID0+IHtcclxuICAgICAgICAgICAgYWQuY292ZXIgPSBkYXRhLmNvdmVySGFzaDtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYWQuY292ZXIpO1xyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIC5jYXRjaChzd2VldEVycm9yKTtcclxuICAgICAgICBTZWxlY3RJbWFnZS5jbG9zZSgpO1xyXG4gICAgICB9LCBvcHRpb25zKTtcclxuICAgIH0sXHJcbiAgICBtb3ZlKGFkLCB0eXBlKSB7XHJcbiAgICAgIGxldCBhZHM7XHJcbiAgICAgIGlmKGFkLnR5cGUgPT09IFwibW92YWJsZVwiKSB7XHJcbiAgICAgICAgYWRzID0gdGhpcy5hZHMubW92YWJsZTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBhZHMgPSB0aGlzLmFkcy5maXhlZDtcclxuICAgICAgfVxyXG4gICAgICBjb25zdCBpbmRleCA9IGFkcy5pbmRleE9mKGFkKTtcclxuICAgICAgaWYoKHR5cGUgPT09IFwibGVmdFwiICYmIGluZGV4ID09PSAwKSB8fCAodHlwZSA9PT0gXCJyaWdodFwiICYmIGluZGV4KzEgPT09IGFkcy5sZW5ndGgpKSByZXR1cm47XHJcbiAgICAgIGxldCBuZXdJbmRleDtcclxuICAgICAgaWYodHlwZSA9PT0gXCJsZWZ0XCIpIHtcclxuICAgICAgICBuZXdJbmRleCA9IGluZGV4IC0gMTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBuZXdJbmRleCA9IGluZGV4ICsgMTtcclxuICAgICAgfVxyXG4gICAgICBjb25zdCBvdGhlckFkID0gYWRzW25ld0luZGV4XTtcclxuICAgICAgYWRzLnNwbGljZShpbmRleCwgMSwgb3RoZXJBZCk7XHJcbiAgICAgIGFkcy5zcGxpY2UobmV3SW5kZXgsIDEsIGFkKTtcclxuICAgIH0sXHJcbiAgICBzYXZlQWRzKCl7XHJcbiAgICAgIGNvbnN0IHttb3ZhYmxlLCBmaXhlZCwgbW92YWJsZU9yZGVyLCBmaXhlZE9yZGVyfSA9IHRoaXMuYWRzO1xyXG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgICAgUHJvbWlzZS5yZXNvbHZlKClcclxuICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICBtb3ZhYmxlLmNvbmNhdChmaXhlZCkubWFwKGFkID0+IHtcclxuICAgICAgICAgICAgc2VsZi5jaGVja1N0cmluZyhhZC50aXRsZSwge1xyXG4gICAgICAgICAgICAgIG5hbWU6IFwi5qCH6aKYXCIsXHJcbiAgICAgICAgICAgICAgbWluTGVuZ3RoOiAxLFxyXG4gICAgICAgICAgICAgIG1heExlbmd0aDogMjAwXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBpZighYWQuY292ZXIpIHRocm93IFwi5bCB6Z2i5Zu+5LiN6IO95Li656m6XCI7XHJcbiAgICAgICAgICAgIGlmKCFhZC50aWQpIHRocm93IFwi5paH56ugSUTkuI3og73kuLrnqbpcIjtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgcmV0dXJuIG5rY0FQSShcIi9ua2MvaG9tZVwiLCBcIlBVVFwiLCB7XHJcbiAgICAgICAgICAgIG9wZXJhdGlvbjogXCJzYXZlQWRzXCIsXHJcbiAgICAgICAgICAgIG1vdmFibGUsXHJcbiAgICAgICAgICAgIGZpeGVkLFxyXG4gICAgICAgICAgICBtb3ZhYmxlT3JkZXIsXHJcbiAgICAgICAgICAgIGZpeGVkT3JkZXJcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgc3dlZXRTdWNjZXNzKFwi5L+d5a2Y5oiQ5YqfXCIpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKHN3ZWV0RXJyb3IpO1xyXG4gICAgfSxcclxuICAgIHJlbW92ZShhZHMsIGluZGV4KXtcclxuICAgICAgYWRzLnNwbGljZShpbmRleCwgMSlcclxuICAgICAgLypzd2VldFF1ZXN0aW9uKFwi56Gu5a6a6KaB5omn6KGM5Yig6Zmk5pON5L2c77yfXCIpXHJcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgYWRzLnNwbGljZShpbmRleCwgMSlcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaCgoKSA9PiB7fSkqL1xyXG5cclxuICAgIH0sXHJcbiAgICBhZGRGb3J1bSgpIHtcclxuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICAgIE1vdmVUaHJlYWQub3BlbihkYXRhID0+IHtcclxuICAgICAgICBjb25zdCB7b3JpZ2luRm9ydW1zfSA9IGRhdGE7XHJcbiAgICAgICAgb3JpZ2luRm9ydW1zLm1hcChmb3J1bSA9PiB7XHJcbiAgICAgICAgICBpZighc2VsZi5zZWxlY3RlZFJlY29tbWVuZEZvcnVtc0lkLmluY2x1ZGVzKGZvcnVtLmZpZCkpIHtcclxuICAgICAgICAgICAgc2VsZi5yZWNvbW1lbmRGb3J1bXMucHVzaChmb3J1bSlcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBNb3ZlVGhyZWFkLmNsb3NlKCk7XHJcbiAgICAgIH0sIHtcclxuICAgICAgICBoaWRlTW92ZVR5cGU6IHRydWVcclxuICAgICAgfSlcclxuICAgIH0sXHJcbiAgICBtb3ZlRm9ydW0oYXJyLCBmLCB0eXBlKSB7XHJcbiAgICAgIGNvbnN0IGluZGV4ID0gYXJyLmluZGV4T2YoZik7XHJcbiAgICAgIGlmKCh0eXBlID09PSBcImxlZnRcIiAmJiBpbmRleCA9PT0gMCkgfHwgKHR5cGUgPT09IFwicmlnaHRcIiAmJiBpbmRleCsxID09PSBhcnIubGVuZ3RoKSkgcmV0dXJuO1xyXG4gICAgICBsZXQgbmV3SW5kZXg7XHJcbiAgICAgIGlmKHR5cGUgPT09IFwibGVmdFwiKSB7XHJcbiAgICAgICAgbmV3SW5kZXggPSBpbmRleCAtIDE7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbmV3SW5kZXggPSBpbmRleCArIDE7XHJcbiAgICAgIH1cclxuICAgICAgY29uc3Qgb3RoZXJBZCA9IGFycltuZXdJbmRleF07XHJcbiAgICAgIGFyci5zcGxpY2UoaW5kZXgsIDEsIG90aGVyQWQpO1xyXG4gICAgICBhcnIuc3BsaWNlKG5ld0luZGV4LCAxLCBmKTtcclxuICAgIH0sXHJcbiAgICByZW1vdmVGb3J1bShhcnIsIGluZGV4KSB7XHJcbiAgICAgIGFyci5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAvKmNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgICBzd2VldFF1ZXN0aW9uKFwi56Gu5a6a6KaB5omn6KGM5Yig6Zmk5pON5L2c77yfXCIpXHJcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgYXJyLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuY2F0Y2goKCkgPT4ge30pKi9cclxuICAgIH0sXHJcbiAgICBzYXZlUmVjb21tZW5kRm9ydW1zKCkge1xyXG4gICAgICBjb25zdCBmb3J1bXNJZCA9IHRoaXMucmVjb21tZW5kRm9ydW1zLm1hcChmb3J1bSA9PiBmb3J1bS5maWQpO1xyXG4gICAgICBua2NBUEkoXCIvbmtjL2hvbWVcIiwgXCJQVVRcIiwge1xyXG4gICAgICAgIG9wZXJhdGlvbjogXCJzYXZlUmVjb21tZW5kRm9ydW1zXCIsXHJcbiAgICAgICAgZm9ydW1zSWRcclxuICAgICAgfSlcclxuICAgICAgICAudGhlbihmdW5jdGlvbigpIHtcclxuICAgICAgICAgIHN3ZWV0U3VjY2VzcyhcIuS/neWtmOaIkOWKn1wiKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaChzd2VldEVycm9yKTtcclxuICAgIH0sXHJcbiAgICBzYXZlQ29sdW1ucygpe1xyXG4gICAgICBjb25zdCBjb2x1bW5zSWQgPSB0aGlzLmNvbHVtbnMubWFwKGMgPT4gYy5faWQpO1xyXG4gICAgICBua2NBUEkoXCIvbmtjL2hvbWVcIiwgXCJQVVRcIiwge1xyXG4gICAgICAgIG9wZXJhdGlvbjogXCJzYXZlQ29sdW1uc1wiLFxyXG4gICAgICAgIGNvbHVtbnNJZFxyXG4gICAgICB9KVxyXG4gICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgIHN3ZWV0U3VjY2VzcyhcIuS/neWtmOaIkOWKn1wiKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaChzd2VldEVycm9yKTtcclxuICAgIH0sXHJcbiAgICBzYXZlR29vZHMoKSB7XHJcbiAgICAgIGNvbnN0IGdvb2RzSWQgPSB0aGlzLmdvb2RzLm1hcChnID0+IGcucHJvZHVjdElkKTtcclxuICAgICAgY29uc3Qgc2hvd1Nob3BHb29kcyA9ICEhdGhpcy5zaG93U2hvcEdvb2RzO1xyXG4gICAgICBua2NBUEkoXCIvbmtjL2hvbWVcIiwgXCJQVVRcIiwge1xyXG4gICAgICAgIG9wZXJhdGlvbjogXCJzYXZlR29vZHNcIixcclxuICAgICAgICBnb29kc0lkLFxyXG4gICAgICAgIHNob3dTaG9wR29vZHNcclxuICAgICAgfSlcclxuICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICBzd2VldFN1Y2Nlc3MoXCLkv53lrZjmiJDlip9cIik7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuY2F0Y2goc3dlZXRFcnJvcik7XHJcbiAgICB9LFxyXG4gICAgc2F2ZVRvcHBlZFRocmVhZHMoKSB7XHJcbiAgICAgIGNvbnN0IHRvcHBlZFRocmVhZHNJZCA9IHRoaXMudG9wcGVkVGhyZWFkcy5tYXAodCA9PiB0LnRpZCk7XHJcbiAgICAgIGNvbnN0IGxhdGVzdFRvcHBlZFRocmVhZHNJZCA9IHRoaXMubGF0ZXN0VG9wcGVkVGhyZWFkcy5tYXAodCA9PiB0LnRpZCk7XHJcbiAgICAgIG5rY0FQSShcIi9ua2MvaG9tZVwiLCBcIlBVVFwiLCB7XHJcbiAgICAgICAgb3BlcmF0aW9uOiBcInNhdmVUb3BwZWRUaHJlYWRzXCIsXHJcbiAgICAgICAgdG9wcGVkVGhyZWFkc0lkLFxyXG4gICAgICAgIGxhdGVzdFRvcHBlZFRocmVhZHNJZFxyXG4gICAgICB9KVxyXG4gICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgIHN3ZWV0U3VjY2VzcyhcIuS/neWtmOaIkOWKn1wiKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaChzd2VldEVycm9yKVxyXG4gICAgfSxcclxuICAgIHNhdmVPcmlnaW5hbFRocmVhZERpc3BsYXlNb2RlKCkge1xyXG4gICAgICBjb25zdCBvcmlnaW5hbFRocmVhZERpc3BsYXlNb2RlID0gdGhpcy5vcmlnaW5hbFRocmVhZERpc3BsYXlNb2RlO1xyXG4gICAgICBua2NBUEkoXCIvbmtjL2hvbWVcIiwgXCJQVVRcIiwge1xyXG4gICAgICAgIG9wZXJhdGlvbjogXCJzYXZlT3JpZ2luYWxUaHJlYWREaXNwbGF5TW9kZVwiLFxyXG4gICAgICAgIG9yaWdpbmFsVGhyZWFkRGlzcGxheU1vZGVcclxuICAgICAgfSlcclxuICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICBzd2VldFN1Y2Nlc3MoXCLkv53lrZjmiJDlip9cIik7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuY2F0Y2goc3dlZXRFcnJvcilcclxuICAgIH0sXHJcbiAgICBzYXZlU2hvd0FjdGl2aXR5RW50ZXIoKSB7XHJcbiAgICAgIGxldCB2YWx1ZSA9IHRoaXMuc2hvd0FjdGl2aXR5RW50ZXIgPT09IFwic2hvd1wiO1xyXG4gICAgICBua2NBUEkoXCIvbmtjL2hvbWUvc2hvd0FjdGl2aXR5RW50ZXJcIiwgXCJQVVRcIiwge1xyXG4gICAgICAgIHNob3dBY3Rpdml0eUVudGVyOiB2YWx1ZVxyXG4gICAgICB9KVxyXG4gICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgc3dlZXRTdWNjZXNzKFwi5L+d5a2Y5oiQ5YqfXCIpO1xyXG4gICAgICB9KVxyXG4gICAgICAuY2F0Y2goc3dlZXRFcnJvcilcclxuICAgIH1cclxuICB9XHJcbn0pO1xyXG4iXX0=
