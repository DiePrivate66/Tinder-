export const RpcPatterns = {
  auth: {
    register: 'auth.register',
    login: 'auth.login',
    me: 'auth.me',
  },
  users: {
    findAll: 'users.findAll',
    create: 'users.create',
    findByEmailForAuth: 'users.findByEmailForAuth',
    getById: 'users.getById',
    getMyProfile: 'users.getMyProfile',
    updateMyProfile: 'users.updateMyProfile',
    addMyPhoto: 'users.addMyPhoto',
    removeMyPhoto: 'users.removeMyPhoto',
    setMyInterests: 'users.setMyInterests',
  },
  match: {
    health: 'match.health',
    create: 'match.create',
    listByUserId: 'match.listByUserId',
  },
} as const;
