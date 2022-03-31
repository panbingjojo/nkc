import User from '../views/user/user';
import UserFollowerAndFans from "../../lib/vue/publicVue/userFollowAndFans/UserFollowerAndFans";
import UserMoment from "../views/user/propfile/profile/UserMoment";
import UserPostList from "../views/user/propfile/profile/UserPostList";
import Subscribe from "../views/user/subscribe/Subscribe";
import ProfileView from "../views/user/propfile/ProfileView";
import Profile from "../views/user/propfile/profile/Profile";
import SubscribeColumns from "../views/user/subscribe/SubscribeColumns";
import SubscribeBlackList from "../views/user/subscribe/SubscribeBlackList";
import SubscribeUsers from "../views/user/subscribe/SubscribeUsers";
import SubscribeForums from "../views/user/subscribe/SubscribeForums";
import SubscribeThreads from "../views/user/subscribe/SubscribeThreads";
export const routerName = {
  user: 'userHome',
  follower: 'follower',
  fans: 'fans',
  moment: 'moment',
  post: 'post',
  blackList: 'blackList',
  subscribe: 'subscribe',
  thread: 'thread',
  profile: 'profile',
  accountUser: 'accountUser',
  subColumns: 'subColumns',
  subUsers: 'subUsers',
  subForums: 'subForums',
  subThreads: 'subThreads',
  profileView: 'profileView',
}

export default [
  {
    name: routerName.user,
    path: '/u/:uid',
    redirect: '/u/:uid/p/moment',
    component: User,
    children: [
      {
        name: routerName.profileView,
        path: '/u/:uid/p',
        component: ProfileView,
        redirect: '/u/:uid/p/moment',
        children: [
          {
            name: routerName.profile,
            path: '/',
            component: Profile,
            children: [
              {
                name: routerName.moment,
                path: '/u/:uid/p/moment',
                component: UserMoment,
              },
              {
                name: routerName.post,
                path: '/u/:uid/p/post',
                component: UserPostList
              },
              {
                name: routerName.thread,
                path: '/u/:uid/p/thread',
                component: UserPostList
              },
              {
                name: routerName.follower,
                path: '/u/:uid/p/follower',
                component: UserFollowerAndFans,
                props: { pageType: "follower" }
              },
              {
                name: routerName.fans,
                path: '/u/:uid/p/fans',
                component: UserFollowerAndFans,
                props: { pageType: "fans" }
              },
            ]
          },
          {
            name: routerName.subscribe,
            path: '/u/:uid/p/s',
            component: Subscribe,
            children: [
              {
                name: routerName.blackList,
                path: '/u/:uid/p/s/blackList',
                component: SubscribeBlackList,
              },
              {
                name: routerName.subColumns,
                path: '/u/:uid/p/s/column',
                component: SubscribeColumns,
              },
              {
                name: routerName.subForums,
                path: '/u/:uid/p/s/forum',
                component: SubscribeForums,
              },
              {
                name: routerName.subUsers,
                path: '/u/:uid/p/s/user',
                component: SubscribeUsers,
              },
              {
                name: routerName.subThreads,
                path: '/u/:uid/p/s/thread',
                component: SubscribeThreads,
              }
            ]
          }
        ]
      }
    ],
    
  }
]

