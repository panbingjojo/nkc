module.exports = async (ctx, next) => {
  //获取用户收藏的文章
  const {db, data, state, params} = ctx;
  const {uid} = params;
  const {targetUser} = data;
  //验证权限
  await next();
};
