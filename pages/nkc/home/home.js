!function n(r,a,s){function i(t,e){if(!a[t]){if(!r[t]){var o="function"==typeof require&&require;if(!e&&o)return o(t,!0);if(c)return c(t,!0);throw(o=new Error("Cannot find module '"+t+"'")).code="MODULE_NOT_FOUND",o}o=a[t]={exports:{}},r[t][0].call(o.exports,function(e){return i(r[t][1][e]||e)},o,o.exports,n,r,a,s)}return a[t].exports}for(var c="function"==typeof require&&require,e=0;e<s.length;e++)i(s[e]);return i}({1:[function(e,t,o){"use strict";for(var n=NKC.methods.getDataById("data"),r=function(e,t){e.type=t},a=0;a<n.ads.movable.length;a++)r(n.ads.movable[a],"movable");for(var s=0;s<n.ads.fixed.length;s++)r(n.ads.fixed[s],"fixed");new Vue({el:"#app",data:{page:{id:"other",name:"其他"},recommendThreads:n.recommendThreads,ads:n.ads,recommendForums:n.recommendForums,columns:n.columns,goods:n.goods,toppedThreads:n.toppedThreads,latestToppedThreads:n.latestToppedThreads,showShopGoods:n.showGoods?"t":"",originalThreadDisplayMode:n.originalThreadDisplayMode,showActivityEnter:n.showActivityEnter?"show":"hidden",updating:!1},mounted:function(){window.SelectImage=new NKC.methods.selectImage,window.MoveThread=new NKC.modules.MoveThread},computed:{selectedRecommendForumsId:function(){return n.recommendForums.map(function(e){return e.fid})},nav:function(){var t=this.page,e=[{id:"other",name:"其他"},{id:"movable",name:"轮播图"},{id:"fixed",name:"固定图"}];return e.map(function(e){e.active=e.id===t.id}),e},threadCount:function(){var e=this.recommendThreads[this.page.id],t=e.automaticProportion,e=e.count,t=Math.round(e*t/(t+1));return{automaticCount:t,manualCount:e-t}}},methods:{checkString:NKC.methods.checkData.checkString,checkNumber:NKC.methods.checkData.checkNumber,getUrl:NKC.methods.tools.getUrl,floatUserInfo:NKC.methods.tools.floatUserInfo,visitUrl:NKC.methods.visitUrl,removeFromArr:function(e,t){e.splice(t,1)},moveFromArr:function(e,t,o){var n,r=e.length;0===t&&"left"===o||t+1===r&&"right"===o||(n=e[t],o=e[r="left"===o?t-1:t+1],Vue.set(e,t,o),Vue.set(e,r,n))},getRecommendTypeName:function(e){return{movable:"轮播图",fixed:"固定图"}[e]},selectPage:function(e){this.page=e},saveRecommendThreads:function(){var e=this.page,t=this.recommendThreads[e.id];nkcAPI("/nkc/home","PUT",{operation:"saveRecommendThreads",type:e.id,options:t}).then(function(){sweetSuccess("保存成功")}).catch(sweetError)},updateThreadList:function(){var e=this.page;this.updating=!0;var t=e.id,o=this;nkcAPI("/nkc/home","PUT",{operation:"updateThreadList",type:t}).then(function(e){o.recommendThreads[t].automaticallySelectedThreads=e.automaticallySelectedThreads,Vue.set(o.saveRecommendThreads),sweetSuccess("更新成功"),o.updating=!1}).catch(function(e){o.updating=!1})},selectLocalFile:function(o){var e={};"movable"===o.type?e.aspectRatio=800/336:e.aspectRatio=400/253,SelectImage.show(function(e){var t=new FormData;t.append("cover",e),t.append("topType",o.type),t.append("tid",o.tid),nkcUploadFile("/nkc/home","POST",t).then(function(e){o.cover=e.coverHash,console.log(o.cover)}).catch(sweetError),SelectImage.close()},e)},move:function(e,t){var o,n="movable"===e.type?this.ads.movable:this.ads.fixed,r=n.indexOf(e);"left"===t&&0===r||"right"===t&&r+1===n.length||(t=n[o="left"===t?r-1:r+1],n.splice(r,1,t),n.splice(o,1,e))},saveAds:function(){var e=this.ads,t=e.movable,o=e.fixed,n=e.movableOrder,r=e.fixedOrder,a=this;Promise.resolve().then(function(){return t.concat(o).map(function(e){if(a.checkString(e.title,{name:"标题",minLength:1,maxLength:200}),!e.cover)throw"封面图不能为空";if(!e.tid)throw"文章ID不能为空"}),nkcAPI("/nkc/home","PUT",{operation:"saveAds",movable:t,fixed:o,movableOrder:n,fixedOrder:r})}).then(function(){sweetSuccess("保存成功")}).catch(sweetError)},remove:function(e,t){e.splice(t,1)},addForum:function(){var t=this;MoveThread.open(function(e){e.originForums.map(function(e){t.selectedRecommendForumsId.includes(e.fid)||t.recommendForums.push(e)}),MoveThread.close()},{hideMoveType:!0})},moveForum:function(e,t,o){var n,r=e.indexOf(t);"left"===o&&0===r||"right"===o&&r+1===e.length||(o=e[n="left"===o?r-1:r+1],e.splice(r,1,o),e.splice(n,1,t))},removeForum:function(e,t){e.splice(t,1)},saveRecommendForums:function(){var e=this.recommendForums.map(function(e){return e.fid});nkcAPI("/nkc/home","PUT",{operation:"saveRecommendForums",forumsId:e}).then(function(){sweetSuccess("保存成功")}).catch(sweetError)},saveColumns:function(){var e=this.columns.map(function(e){return e._id});nkcAPI("/nkc/home","PUT",{operation:"saveColumns",columnsId:e}).then(function(){sweetSuccess("保存成功")}).catch(sweetError)},saveGoods:function(){var e=this.goods.map(function(e){return e.productId}),t=!!this.showShopGoods;nkcAPI("/nkc/home","PUT",{operation:"saveGoods",goodsId:e,showShopGoods:t}).then(function(){sweetSuccess("保存成功")}).catch(sweetError)},saveToppedThreads:function(){var e=this.toppedThreads.map(function(e){return e.tid}),t=this.latestToppedThreads.map(function(e){return e.tid});nkcAPI("/nkc/home","PUT",{operation:"saveToppedThreads",toppedThreadsId:e,latestToppedThreadsId:t}).then(function(){sweetSuccess("保存成功")}).catch(sweetError)},saveOriginalThreadDisplayMode:function(){var e=this.originalThreadDisplayMode;nkcAPI("/nkc/home","PUT",{operation:"saveOriginalThreadDisplayMode",originalThreadDisplayMode:e}).then(function(){sweetSuccess("保存成功")}).catch(sweetError)},saveShowActivityEnter:function(){var e="show"===this.showActivityEnter;nkcAPI("/nkc/home/showActivityEnter","PUT",{showActivityEnter:e}).then(function(){sweetSuccess("保存成功")}).catch(sweetError)}}})},{}]},{},[1]);