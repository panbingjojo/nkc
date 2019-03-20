const Router = require('koa-router');
const router = new Router();
router
  // 取消订单
  .use('/', async (ctx, next) => {
    const {data, params, db} = ctx;
    data.order = await db.ShopOrdersModel.findOne({orderId: params.orderId});
    if(!data.order) ctx.throw(400, `订单【${params.orderId}】不存在, 请刷新`);
    await next();
  })
  .patch('/cancel', async(ctx, next) => {
    const {data, params, db, query, body} = ctx;
    const {user} = data;
    const {orderId} = params;
    const order = await db.ShopOrdersModel.findOne({orderId});
    if(!order) ctx.throw(400, "订单不存在");
    if(order.uid !== user.uid) ctx.throw(304, "您无权操作该订单");
    await order.update({$set:{"closeStatus":true}});
    await next();
  })
  // 查看物流
  .get('/logistics', async(ctx, next) => {
    const {data, db, params, body, nkcModules} = ctx;
    const {user} = data;
    const {orderId} = params;
    if(!orderId) ctx.throw(400, "订单号有误");
    const order = await db.ShopOrdersModel.findOne({orderId});
    if(!order) ctx.throw(400, "未找到该订单");
    if(user.uid !== order.uid) ctx.throw(400, "您无权查看该订单的物流信息");
    if(!order.trackNumber) ctx.throw(400, "暂无物流信息");
    let trackNumber = order.trackNumber;
    const trackInfo = await nkcModules.apiFunction.getTrackInfo("3399564142457");
    data.trackNumber = trackNumber;
    data.trackInfo = trackInfo;
    ctx.template = "/shop/order/logistics.pug";
    await next();
  })
  // 确认收货
  .patch('/receipt', async(ctx, next) => {
    const {data, db, params, body} = ctx;
    const {user} = data;
    const {orderId} = params;
    if(!orderId) ctx.throw(400, "订单号有误");
    const order = await db.ShopOrdersModel.findOne({orderId});
    if(!order) ctx.throw(400, "未找到订单");
    if(user.uid !== order.uid) ctx.throw(400, "您无权操作此订单");
    await order.update({$set:{"orderStatus":"finish"}})
    await next();
  });
module.exports = router;