import { createRouter, createWebHistory, type RouteRecordNameGeneric, type RouteRecordRaw } from 'vue-router';
import Main from '@views/Main.vue';
import Home from '@views/Home.vue';
import Login from '@views/Login.vue';
import ClockIn from '@/views/ClockIn.vue';
import ClockOut from '@/views/ClockOut.vue';
import Service from '@views/Service.vue';
import Salary from '@views/Salary.vue';
import Room from '@/views/maintains/Room.vue';
import _Worker from '@/views/maintains/Worker.vue';
import Setting from '@views/Setting.vue';
import Maintain from '@views/Maintain.vue';
import ReceivingPayments from '@/views/ReceivingPayment.vue';
import Dashboard from './views/Dashboard.vue';
import IcomeReport from './views/IcomeReport.vue';
import { sort } from '@/utils/utils';
import { getBreadcrumbsList, useBreadcrumbsStore } from '@stores/BreadcrumbsStore';
import { get } from '@utils/api';

enum ERouterBlock {
  normal,
  function,
  setting
}

export interface IMenuData {
  showBlock?: ERouterBlock;
  isSeparator?: boolean;
  label?: string;
  icon?: string;
  to: { path: string, name?: RouteRecordNameGeneric };
  toPath: string;
  toName?: RouteRecordNameGeneric;
  disable: boolean;
  order?: number;
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
  hasChildren?: boolean;
  children: IMenuData[];
}

export interface IRouteMeta {
  showInMenu?: boolean;
  showBlock?: ERouterBlock;
  label: string;
  icon: string;
  order?: number;
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
  disable?: boolean;
}

const routes: RouteRecordRaw[] = [
    {
      path: '/',
      component: Main,
      meta: {
        label: '首页',
        icon: 'home'
      },
      children: [{
          name: 'home',
          path: '/',
          component: Home,
          meta: {
            showInMenu: true,
            showBlock: ERouterBlock.normal,
            label: '首页',
            icon: 'home',
            order: 1
          }
        }, {
          name: 'dashboard',
          path: '/dashboard',
          component: Dashboard,
          meta: {
            showInMenu: true,
            showBlock: ERouterBlock.normal,
            label: '仪表板',
            icon: 'dashboard',
            order: 2,
            requiresAuth: true,
            requiresAdmin: true
          }
        }, { 
          name: 'clock_in',
          path: '/clock_in',
          component: ClockIn,
          meta: {
            showInMenu: true,
            showBlock: ERouterBlock.function,
            label: '上钟',
            icon: 'pending_actions',
            order: 1,
            requiresAuth: true
          }
        }, { 
          name: 'clock_out',
          path: '/clock_out',
          component: ClockOut,
          meta: {
            showInMenu: true,
            showBlock: ERouterBlock.function,
            label: '下钟',
            icon: 'pending_actions',
            order: 2,
            requiresAuth: true
          }
        }, { 
          name: 'service',
          path: '/service',
          component: Service,
          meta: {
            showInMenu: true,
            showBlock: ERouterBlock.normal,
            label: '服务',
            icon: 'assignment',
            order: 3
          }
        }, {
          name: 'salary',
          path: '/salary',
          component: Salary,
          meta: {
            showInMenu: true,
            showBlock: ERouterBlock.function,
            label: '工资',
            icon: 'attach_money',
            order: 3,
            requiresAuth: true
          }
        }, {
          name: 'income_report',
          path: '/income_report',
          component: IcomeReport,
          meta: {
            showInMenu: true,
            showBlock: ERouterBlock.function,
            label: '进账报表',
            icon: 'monetization_on',
            order: 4,
            requiresAuth: true,
            requiresAdmin: true
          }
        }, {
          name: 'receiving_payments',
          path: '/receiving_payments',
          component: ReceivingPayments,
          meta: {
            showInMenu: true,
            showBlock: ERouterBlock.function,
            label: '收款',
            icon: 'payments',
            order: 5,
            requiresAuth: true,
            requiresAdmin: true
          }
        }, {
          name: 'maintain',
          path: '/maintain',
          component: Maintain,
          meta: {
            showInMenu: true,
            showBlock: ERouterBlock.setting,
            label: '维护',
            icon: 'edit',
            order: 1,
            requiresAuth: true,
            requiresAdmin: true,
            disable: true
          },
          children: [{
            name: 'room',
            path: 'room',
            component: Room,
            meta: {
              showInMenu: true,
              showBlock: ERouterBlock.normal,
              label: '包间',
              icon: 'meeting_room',
              order: 1,
              requiresAuth: true,
              requiresAdmin: true,
            }
          }, {
            name: 'worker',
            path: 'worker',
            component: _Worker,
            meta: {
              showInMenu: true,
              showBlock: ERouterBlock.normal,
              label: '技师',
              icon: 'man',
              order: 2,
              requiresAuth: true,
              requiresAdmin: true,
            }
          }]
        }, {
          name: 'setting',
          path: '/setting',
          component: Setting,
          meta: {
            showInMenu: true,
            showBlock: ERouterBlock.setting,
            label: '设定',
            icon: 'settings',
            order: 2,
            requiresAuth: true,
            requiresAdmin: true
          }
        }
      ],
    },
    {
      name: 'login',
      path: '/login',
      component: Login
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

async function canUserAccess () {
  return await get('authen');
}

router.beforeEach(async (to, _from) => {
  if (to.meta.requiresAuth) {
    try {
      const res = await canUserAccess();
      if (to.meta.requiresAdmin && !res.data.data.is_admin) {
        throw new Error();
      }
    } catch (err) {
      return '/login';
    }
  }

  if (to.name !== 'login') {
    const breadcrumbsStore = useBreadcrumbsStore();
    breadcrumbsStore.setPageList(getBreadcrumbsList(to));
  }
});

function getChildrenMenuList(menus?: RouteRecordRaw[]): IMenuData[] {
  if (!menus || menus.length === 0) {
    return [];
  }

  const menuList = menus
    .filter((r) => !r.meta?.hidden || r.meta?.showInMenu)
    .map(r => ({
      showBlock: r.meta?.showBlock,
      label: r.meta?.label as string,
      icon: r.meta?.icon as string,
      to: { path: r.path, name: r.name },
      toPath: r.path,
      toName: r.name,
      disable: r.meta?.disable as boolean ?? false,
      order: r.meta?.order as number ?? undefined,
      requiresAuth: r.meta?.requiresAuth as boolean ?? false,
      requiresAdmin: r.meta?.requiresAdmin as boolean ?? false,
      hasChildren: r.children && r.children.length !== 0 ? true : false,
      children: getChildrenMenuList(r.children)
    }));
  const normalMenu = sort(menuList.filter((r) => (r.showBlock === ERouterBlock.normal || !r.showBlock)) as IMenuData[], 'order');
  const functionMenu = sort(menuList.filter((r) => r.showBlock === ERouterBlock.function) as IMenuData[], 'order');
  const settingMenu = sort(menuList.filter((r) => r.showBlock === ERouterBlock.setting) as IMenuData[], 'order');
  const separatorMenu = {
    isSeparator: true
  } as IMenuData;

  const mainMenu = normalMenu;
  if (functionMenu.length) {
    mainMenu.push(separatorMenu);
    mainMenu.push(...functionMenu);
  }
  if (settingMenu.length) {
    mainMenu.push(separatorMenu);
    mainMenu.push(...settingMenu);
  }

  return mainMenu;
}

async function getMenuList(): Promise<{
  res?: any,
  menus: IMenuData[]
}> {
  let res;
  try {
    res = await canUserAccess();
  } catch (err) {
    
  }
  const main = router.options.routes.find(r => r.path === '/');
  return {
    res,
    menus: getChildrenMenuList(main?.children || [])
  }
}

export {
  getMenuList
};

export default router;