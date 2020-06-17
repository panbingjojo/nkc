module.exports = [
  {
    fid: '1',
    displayName: '系统',
    abbr: '系统',
    description: '此专业仅提供系统信息的展示',
    brief: '此专业仅提供系统信息的展示',
    accessible: true,
    displayOnParent: true,
    visibility: true,
    isVisibleForNCC: true,
    rolesId: ['dev', 'default', 'visitor'],
    type: 'category'
  },
  {
    fid: '2',
    displayName: '系统通知',
    abbr: '通知',
    description: '系统通知',
    brief: '系统通知',
    accessible: true,
    displayOnParent: true,
    visibility: true,
    isVisibleForNCC: true,
    rolesId: ['dev', 'default', 'visitor'],
    type: 'forum',
    parentsId: [1]
  },
  {
    fid: 'recycle',
    displayName: '回收站',
    abbr: '回收站',
    description: '系统回收站',
    brief: '回收站',
    accessible: true,
    displayOnParent: true,
    visibility: true,
    isVisibleForNCC: true,
    rolesId: ['dev', 'default', 'visitor'],
    type: 'forum',
    parentsId: [1]
  }
];
