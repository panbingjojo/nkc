const Router = require('koa-router');
const settingsRouter = new Router();
settingsRouter
  .patch('/', async (ctx, next) => {
    const {data, db, body} = ctx;
    const {user} = data;
    const {beep, messageSettings} = body;
    const usersGeneral = await db.UsersGeneralModel.findOnly({uid: user.uid});
    if(messageSettings) {
      await usersGeneral.update({messageSettings: messageSettings});
    } else {
      await usersGeneral.update({'messageSettings.beep': beep});
    }

    await next();
  });
module.exports = settingsRouter;