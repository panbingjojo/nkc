const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    const {db, data, query, nkcModules} = ctx;
    let {page = 0, t = ''} = query;
    const {getUrl} = nkcModules.tools;
    const {
      stable: stableDocumentType
    } = await db.DocumentModel.getDocumentTypes();
    const documentSourcesObj = await db.DocumentModel.getDocumentSources();
    const articleSourcesObj = await db.ArticleModel.getArticleSources();
    const commentSourcesObj = await db.CommentModel.getCommentSources();
    delete documentSourcesObj.draft;
    const documentSources = Object.values(documentSourcesObj);
    const match = {
      type: stableDocumentType,
      source: {$ne: documentSourcesObj.draft}
    };
    if(t) {
      if(documentSources.includes(t)) {
        match.source = t;
      } else {
        ctx.throw(400, `document source error. source=${t}`);
      }
    }
    const count = await db.DocumentModel.countDocuments(match);
    const paging = nkcModules.apiFunction.paging(page, count);
    const documents = await db.DocumentModel.find(match).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
    const usersId = [];
    const momentsId = [];
    const articlesId = [];
    const commentsId = [];
    const momentsListObj = {};
    for(const document of documents) {
      const {
        uid, source, sid,
      } = document;
      usersId.push(uid);
      switch(source) {
        case documentSourcesObj.article: {
          articlesId.push(sid);
          break;
        }
        case documentSourcesObj.moment: {
          momentsId.push(sid);
          break;
        }
        case documentSourcesObj.comment: {
          commentsId.push(sid);
          break;
        }
        default: break;
      }
    }

    const usersObj = await db.UserModel.getUsersObjectByUsersId(usersId);
    const articlesObj = await db.ArticleModel.getArticlesObjectByArticlesId(articlesId);
    const momentsObj = await db.MomentModel.getMomentsObjectByMomentsId(momentsId);
    const momentsList = await db.MomentModel.extendMomentsListData(Object.values(momentsObj));
    const commentsObj = await db.CommentModel.getCommentsObjectByCommentsId(commentsId);
    const commentsInfo = await db.CommentModel.getCommentInfo(Object.values(commentsObj));
    const commentsUrl = {};
    for(const commentInfo of commentsInfo) {
      commentsUrl[commentInfo._id] = commentInfo.url;
    }
    for(const m of momentsList) {
      momentsListObj[m.momentId] = m;
    }
    const documentsInfo = [];
    for(const document of documents) {
      const {
        _id,
        did,
        toc,
        uid,
        source,
        sid,
        abstract = '',
        abstractEN = '',
        content = '',
        title = '',
        keywords = [],
        keywordsEN = [],
        status = ''
      } = document;
      const user = usersObj[uid];

      let from;
      let url;
      let momentInfo;

      switch(source) {
        case documentSourcesObj.article: {
          const article = articlesObj[sid];
          const {articleUrl} = await db.ArticleModel.getArticleUrlBySource(
            article._id,
            article.source,
            article.sid,
          );
          url = articleUrl;
          switch(article.source) {
            case articleSourcesObj.column: {
              from = '专栏文章';
              break;
            }
            case articleSourcesObj.zone: {
              from = '空间文章';
              break;
            }
            default: break;
          }
          break;
        }
        case documentSourcesObj.moment: {
          const moment = momentsObj[sid];
          momentInfo = momentsListObj[moment._id];
          url = getUrl('zoneMoment', moment._id);
          from = '动态';
          break;
        }
        case documentSourcesObj.comment: {
          const comment = commentsObj[sid];
          url = commentsUrl[comment._id];
          switch(comment.source) {
            case commentSourcesObj.zone: {
              from = '空间文章评论';
              break;
            }
            case commentSourcesObj.column: {
              from = '专栏文章评论';
              break;
            }
            default: break;
          }
          break;
        }
      }
      const documentResourceId = await document.getResourceReferenceId();
      let resources = await db.ResourceModel.getResourcesByReference(documentResourceId);
      const result = {
        _id,
        did,
        toc,
        // 作者相关
        uid,
        username: user.username,
        userAvatarUrl: getUrl('userAvatar', user.avatar),
        // 内容相关
        abstract,
        abstractEN,
        keywords,
        keywordsEN,
        title,
        content: nkcModules.nkcRender.renderHTML({
          type: 'article',
          post: {
            c: content,
            resources
          },
        }),
        // 类型相关
        from, // string 来源
        url,
        status,
        source,
      };
      //如果是动态就加入动态资源和引用信息
      if(source === documentSourcesObj.moment) {
        result.momentInfo = momentInfo;
      }
      documentsInfo.push(result);
    }

    data.documentsInfo = documentsInfo;
    data.t = t;
    data.paging = paging;
    ctx.template = 'nkc/document/document.pug';
    data.nav = 'document';
    await next();
  });
module.exports = router;
