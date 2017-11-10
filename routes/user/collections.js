const Router = require('koa-router');
const collectionsRouter = new Router();
const nkcModules = require('../../nkcModules');
let dbFn = nkcModules.dbFunction;

collectionsRouter
  .get('/:category', async (ctx, next) => {
    let db = ctx.db;
    let category = ctx.params.category;
    let user = ctx.data.user;
    let targetUserUid = ctx.params.uid;
    let targetUser = {};
    if(user && user.uid === targetUserUid) {
      targetUser = user;
    }else {
      targetUser = await db.UserModel.findOne({uid: targetUserUid});
    }
    ctx.data.forumList = await dbFn.getAvailableForums(ctx);
    ctx.data.targetUser = targetUser;
    let categoryNames = await db.CollectionModel.aggregate([
      {$match: {uid: targetUserUid}},
      {$sort: {toc: 1}},
      {$group: {_id: '$category'}},
    ]);
    for (let i =0; i < categoryNames.length; i++) {
      categoryNames[i] = categoryNames[i]._id;
      if(!categoryNames[i]) categoryNames[i] = 'unclassified';
    }
    ctx.data.categoryNames = categoryNames;
    let queryDate = {
      uid: targetUserUid,
      category: category
    };
    let categoryThreads = [];
    let collectionCount = await db.CollectionModel.count(queryDate);
    if(collectionCount <= 0) {
      queryDate.category = categoryNames[0];
    }
    categoryThreads = await dbFn.foundCollection(queryDate);
    ctx.template = 'interface_collections.pug';
    ctx.data.category = queryDate.category;
    ctx.data.categoryThreads = categoryThreads;
    await next();
  })
  .put('/', async (ctx, next) => {
    const {db} = ctx;
    const {user} = ctx.data;
    let {cid, category} = ctx.body;
    if(category === 'null') category = '';
    let collection = await db.CollectionModel.findOne({cid: cid});
    if(user.uid !== collection.uid) ctx.throw(401, '抱歉，你没有资格修改别人的收藏');
    await db.CollectionModel.replaceOne({uid: user.uid, cid: cid},{$set: {category: category}});
    await next();
  })
  .del('/:cid', async (ctx, next) => {
    const {db} = ctx;
    const {user} = ctx.data;
    let {cid} = ctx.params;
    let collection = await db.CollectionModel.findOne({cid: cid});
    if(user.uid !== collection.uid) ctx.throw(401, '抱歉，你没有资格删除别人的收藏');
    await db.CollectionModel.deleteOne({cid: cid});
    await next();
  });

module.exports = collectionsRouter;