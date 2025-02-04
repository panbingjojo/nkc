module.exports = async (ctx) => {
  const {state, nkcModules, template, remoteTemplate, db} = ctx;
  // 取网站代号
  let serverSetting = await db.SettingModel.getSettings("server");
  if(!template && !remoteTemplate) return;
  const userInfo = !state.uid? null: {
    uid: state.uid,
    name: state.user.username,
    avatar: nkcModules.tools.getUrl('userAvatar', state.user.avatar),
    banner: nkcModules.tools.getUrl('userBanner', state.user.banner),
    certsName: state.user.info? state.user.info.certsName: '',
    xsf: state.user.xsf,
    gradeId: state.user.grade._id,
    gradeName: state.user.grade.displayName,
    gradeColor: state.user.grade.color,
    gradeIcon: nkcModules.tools.getUrl("gradeIcon", state.user.grade._id),
    scores: state.userScores? state.userScores.map(score => {
      score.icon = nkcModules.tools.getUrl('scoreIcon', score.icon);
      return score;
    }): [],
    columnId: state.userColumn? state.userColumn._id: null,
    columnPermission: state.columnPermission,
    draftCount: state.user.draftCount,
  };

  ctx.remoteState = {
    uid: state.uid,
    userInfo,
    xsfIcon: nkcModules.tools.getUrl('defaultFile', 'xsf.png'),
    isProduction: process.env.NODE_ENV === 'production',
    url: state.url,
    isApp: state.isApp,
    appOS: state.appOS,
    platform: state.platform,
    operationId: state.operation._id,
    fileDomain: state.fileDomain,
    serverSettings: state.serverSettings,
    selectTypesWhenSubscribe: state.uid?!!state.user.generalSettings.subscribeSettings.selectTypesWhenSubscribe:false,
    logoICO: state.logoICO,
    lotteryStatus: state.uid? state.user.generalSettings.lotterySettings.status: false,
    appStableVersion: state.appStableVersion,
    startTime: global.NKC.startTime,
    nkcSourceMask: {
      isDisplay: state.threadSettings.playerTips.isDisplay,
      tipContent: state.threadSettings.playerTips.tipContent
    },
    navbar: state.navbar || 'standard', // standard, full
  };
}
