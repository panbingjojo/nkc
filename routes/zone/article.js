const router = require('koa-router')();
const {renderMarkdown} = require('../../nkcModules/markdown');

function isIncludes(arr, id, type) {
  for(const a of arr) {
    if(a.id === id && a.type === type)  return true;
  }
  return false;
}

router
  .get('/:aid', async (ctx, next) => {
    //获取空间文章信息
    ctx.template = 'zone/article.pug'
    const { db, data, params, query, state, permission, nkcModules } = ctx;
    const { aid } = params;
    const {pageSettings, uid} = state;
    const {user} = data;
    const {page = 0, last_pages, highlight, t, did, redirect, token} = query;
    const {normal: commentStatus, default: defaultComment} = await db.CommentModel.getCommentStatus();
    let article = await db.ArticleModel.findOnly({_id: aid});
    data.targetUser = await article.extendUser();
    data.targetUser.description = renderMarkdown(nkcModules.nkcRender.replaceLink(data.targetUser.description));
    data.targetUser.avatar = nkcModules.tools.getUrl('userAvatar', data.targetUser.avatar);
    await data.targetUser.extendGrade();
    await db.UserModel.extendUserInfo(data.targetUser);
    // data.targetColumn = await db.UserModel.getUserColumn(data.targetUser.uid);
    // if(data.targetColumn) {
    //   data.ColumnPost = await db.ColumnPostModel.findOne({columnId: data.targetColumn._id, type : 'article', pid: article._id});
    // }
    if(state.userColumn) {
      data.addedToColumn = (await db.ColumnPostModel.countDocuments({columnId: state.userColumn._id, type: "article", pid: aid})) > 0;
    }
    data.columnInfo = {
      userColumn: state.userColumn,
      columnPermission: state.columnPermission,
      column: state.userColumn,
    };
    if(token) {
      //如果存在token就验证token是否合法
      await db.ShareModel.hasPermission(token, article._id)
    }
    //查找文章的评论盒子
    const articlePost = await db.ArticlePostModel.findOne({sid: article._id, source: article.source});
    // 获取空间文章需要显示的数据
    const articleRelatedContent = await db.ArticleModel.getZoneArticle(article._id);
    const homeSettings = await db.SettingModel.getSettings("home");
    //点击楼层高亮需要url和highlight值
    data.originUrl = state.url
    data.highlight = highlight;
    data.columnPost = articleRelatedContent;
    data.columnPost.article.vote = await db.PostsVoteModel.getVoteByUid({uid: user.uid, id: data.columnPost.article._id, type: 'article'});
    data.homeTopped = await db.SettingModel.isEqualOfArr(homeSettings.toppedThreadsId, {id: article._id, type: 'article'});
    const isModerator = await article.isModerator(state.uid);
    //获取当前文章信息
    // const _article = (await db.ArticleModel.extendDocumentsOfArticles([article], 'stable', [
    //   '_id',
    //   'uid',
    //   'status'
    // ]))[0];
    const {normal: normalStatus} = await db.ArticleModel.getArticleStatus();
    const _article = (await db.ArticleModel.getArticlesInfo([article]))[0];
    if(_article.document.status !== normalStatus && !isModerator) {
      if(!permission('review')) {
        return ctx.throw(403, '权限不足');
      }
    }
    let match = {
    };
    if(articlePost) {
      match.sid = articlePost._id;
    }
    //只看作者
    if(t === 'author') {
      data.t = t;
      match.uid = _article.uid;
    }
    const permissions = {
      cancelXsf: ctx.permission('cancelXsf'),
      modifyKcbRecordReason: ctx.permission('modifyKcbRecordReason'),
    };
    //获取文章收藏数
    data.columnPost.collectedCount = await db.ArticleModel.getCollectedCountByAid(article._id);
    if(user) {
      if(permission('review')) {
        permissions.reviewed = true;
      } else {
        match.$or = [
          {status: commentStatus},
          {uid}
        ];
      }
      //禁用和退修权限
      if(permission('movePostsToRecycle') || permission('movePostsToDraft')) {
        permissions.disabled = true
      }
      //是否收藏该文章
      const collection = await db.SubscribeModel.findOne({cancel: false, uid: data.user.uid, tid: article._id, type: "article"});
      if(collection) {
        data.columnPost.collected = true;
      }
    }
    let count = 0;
    //获取评论分页
    if(articlePost) {
      count = await db.CommentModel.countDocuments(match);
    }
    const paging = nkcModules.apiFunction.paging(page, count, pageSettings.homeThreadList);
    data.paging = paging;
    let comment = null;
    let comments = [];
    //获取该文章下当前用户编辑了未发布的评论内容
    if(articlePost) {
      const m = {
        uid: state.uid,
        status: defaultComment,
        sid: articlePost._id,
      };
      comment = await db.CommentModel.getCommentsByArticleId({match: m,});
      //获取该文章下的评论
      comments = await db.CommentModel.getCommentsByArticleId({match, paging});
    }
    if(comments && comments.length !== 0) {
      comments = await db.CommentModel.extendPostComments({comments, uid: state.uid, isModerator, permissions});
    }
    if(comment && comment.length !== 0) {
      //拓展单个评论内容
      comment = await comment[0].extendEditorComment();
      if(comment.type === 'beta') {
        data.comment = comment || '';
      }
    }
    data.articleStatus = _article.document.status;
    const hidePostSettings = await db.SettingModel.getSettings("hidePost");
    data.postHeight = hidePostSettings.postHeight;
    data.permissions = permissions;
    data.isModerator =  isModerator;
    data.comments = comments || [];
    data.article = _article;
    //文章浏览数加一
    await article.addArticleHits();
    await next();
  });
module.exports = router;
