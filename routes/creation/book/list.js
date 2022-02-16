const router = require('koa-router')();
const callBack = async (ctx, next)=>{
  const {db, body} = ctx
  const {data, bid} = body
  let filteredData = await db.BookModel.filterList(data)
  await db.BookModel.updateOne(
    { _id: bid },
    { $set: { list: filteredData } }
  );
  await next();
}
router
  .post('/delete', callBack )
  .post('/move', callBack )
  .post('/add', callBack )
  
module.exports = router;