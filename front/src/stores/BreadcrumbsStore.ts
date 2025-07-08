import { defineStore } from 'pinia';
import { reactive } from 'vue';
import type { IMenuData } from '@/router';
import type { RouteLocationNormalizedGeneric } from 'vue-router';

export interface IBreadcrumbs extends Pick<IMenuData, 'label' | 'icon' | 'to' | 'toPath' | 'toName' | 'disable'> {

}

function unshiftHome(breadcrumbs: IBreadcrumbs[]) {
    if (breadcrumbs[0].toName !== 'home') {
        breadcrumbs.unshift({
            label: '首页',
            icon: 'home',
            to: { path: '/', name: 'home' },
            toPath: '/',
            toName: 'home',
            disable: false,
        });
    }

    return breadcrumbs;
}

export function getBreadcrumbsList(to: RouteLocationNormalizedGeneric): IBreadcrumbs[] {
  return to.matched
    .filter((r) => r.name !== undefined)
    .map(r => ({
      label: r.meta?.label as string,
      icon: r.meta?.icon as string,
      to: { path: r.path, name: r.name },
      toPath: r.path,
      toName: r.name,
      disable: r.meta?.disable as boolean ?? false
    }));
}

export const useBreadcrumbsStore = defineStore('breadcrumbs', () => {
    const pageList = reactive<IBreadcrumbs[]>([]);
    function setPageList (breadcrumbs: IBreadcrumbs[]) {
        const _breadcrumbs = unshiftHome(breadcrumbs);
        pageList.splice(0, pageList.length);
        pageList.push(..._breadcrumbs);
    }

    return {
        pageList, setPageList
    }
});