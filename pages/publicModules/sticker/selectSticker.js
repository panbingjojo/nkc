!function o(n,r,a){function c(t,e){if(!r[t]){if(!n[t]){var i="function"==typeof require&&require;if(!e&&i)return i(t,!0);if(s)return s(t,!0);throw(i=new Error("Cannot find module '"+t+"'")).code="MODULE_NOT_FOUND",i}i=r[t]={exports:{}},n[t][0].call(i.exports,function(e){return c(n[t][1][e]||e)},i,i.exports,o,n,r,a)}return r[t].exports}for(var s="function"==typeof require&&require,e=0;e<a.length;e++)c(a[e]);return c}({1:[function(e,t,i){"use strict";NKC.modules.SelectSticker=function(){var o=this;o.dom=$("#moduleSelectSticker"),o.app=new Vue({el:"#moduleSelectStickerApp",data:{type:"own",pageNumber:"",perpage:20,sharePerpage:24,emoji:[],share:!1,localStickers:[],stickers:[],paging:{}},mounted:function(){},methods:{getUrl:NKC.methods.tools.getUrl,initModule:function(){o.dom.css({height:"43.5rem"}),o.dom.draggable({scroll:!1,handle:".module-ss-title",drag:function(e,t){t.position.top<0&&(t.position.top=0);var i=$(window).height();t.position.top>i-30&&(t.position.top=i-30);i=o.dom.width();t.position.left<100-i&&(t.position.left=100-i);i=$(window).width();t.position.left>i-100&&(t.position.left=i-100)}})},resetDomPosition:function(){var e=o.dom,t=$(window).width();$(window).height();t<700?e.css({width:.8*t,top:0,right:0}):e.css("left",.5*(t-e.width())-40)},selectType:function(e){this.type=e,["own","share"].includes(e)&&this.getStickers()},changePage:function(e){var t=this.paging;t.buttonValue.length<=1||"last"===e&&0===t.page||"next"===e&&t.page+1===t.pageCount||this.getStickers(t.page+("last"===e?-1:1))},getStickers:function(){var e,t=0<arguments.length&&void 0!==arguments[0]?arguments[0]:0,i=this.type;["own","share"].includes(i)&&(e="/sticker?page=".concat(t,"&c=own&reviewed=true&perpage=").concat(this.perpage),"share"===i&&(e="/stickers?page=".concat(t,"&perpage=").concat(this.sharePerpage)),nkcAPI(e,"GET").then(function(e){o.app.stickers=e.stickers,o.app.paging=e.paging,e.emoji&&(o.app.emoji=e.emoji)}).catch(sweetError))},fastSelectPage:function(){var e=this.pageNumber-1,t=this.paging;if(t&&t.buttonValue.length){t=t.buttonValue[t.buttonValue.length-1].num;if(e<0||t<e)return sweetInfo("输入的页数超出范围");this.getStickers(e)}},selectSticker:function(e){o.callback({type:"sticker",data:e})},selectEmoji:function(e,t){o.callback({type:"emoji",data:e})},addLocalFile:function(e){this.fileToSticker(e).then(function(e){o.app.localStickers.push(e),o.app.uploadLocalSticker(e)})},fileToSticker:function(o){return new Promise(function(t,e){var i={file:o,status:"unUploaded",progress:0};NKC.methods.fileToUrl(o).then(function(e){i.url=e,t(i)}).catch(e)})},selectedLocalFile:function(){for(var e=$("#moduleSelectStickerInput")[0].files,t=0;t<e.length;t++){var i=e[t];o.app.addLocalFile(i)}},selectLocalFile:function(){$("#moduleSelectStickerInput").click()},uploadLocalSticker:function(i){Promise.resolve().then(function(){i.status="uploading";var e=new FormData;return e.append("file",i.file),e.append("type","sticker"),e.append("fileName",i.file.name),o.app.share&&e.append("share","true"),nkcUploadFile("/r","POST",e,function(e,t){i.progress=t})}).then(function(){i.status="uploaded",o.app.localStickers.splice(o.app.localStickers.indexOf(i),1),o.app.localStickers.length||o.app.selectType("own")}).catch(function(e){screenTopWarning(e.error||e),i.error=e.error||e,i.status="unUploaded"})},restartUpload:function(e){this.uploadLocalSticker(e)},open:function(e,t){o.callback=e,this.resetDomPosition(),this.initModule(),o.dom.show(),this.getStickers()},close:function(){o.dom.hide()}}}),o.open=o.app.open,o.close=o.app.close}},{}]},{},[1]);