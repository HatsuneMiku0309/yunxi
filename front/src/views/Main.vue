<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterView, useRouter } from 'vue-router';
import { getMenuList, type IMenuData } from '@/router';
import { useBreadcrumbsStore } from '@stores/BreadcrumbsStore';
import { useQuasar } from 'quasar';
import ExpansionTree from '@components/ExpansionTree.vue';
import { post } from '@/utils/api';

const menuList = ref<{
  res?: any,
  menus: IMenuData[]
}>();
const res = ref<undefined | { data: { data: { is_admin: boolean }} }>();
const menus = ref<IMenuData[]>([]);
const router = useRouter();

onMounted(async () => {
  menuList.value = await getMenuList();
  const { res: _res, menus: _menus } = menuList.value;
  res.value = _res;
  menus.value = _menus;
});
const breadcrumbsStore = useBreadcrumbsStore();
const leftDrawerOpen = ref(false);
// const rightDrawerOpen = ref(false);
const $q = useQuasar();
const userAccout = $q.cookies.get('account');
const isMobileDrawer = computed(() => $q.screen.lt.md);
const screenWidth = computed(() => {
  const drawerWidth = 300;
  const screenWidth = !isMobileDrawer.value
    ? leftDrawerOpen.value ? $q.screen.width - drawerWidth : $q.screen.width
    : $q.screen.width;
  return  screenWidth;
});


function toggleLeftDrawer () {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function isShowLogin(isAuth?: boolean) {
  
  return isAuth ? !!res.value : true;
}

function isShowAdmin(isAdmin?: boolean) {
  
  return isAdmin ? res.value ? res.value.data.data.is_admin : false : true;
}

async function logout() {
  await post('/logout', {});
  await router.push({ name: 'login' });
}
// function toggleRightDrawer() {
//   rightDrawerOpen.value = !rightDrawerOpen.value
// }
</script>

<template>
  <q-layout view="lHh lpR fFf">
    <q-header reveal elevated class="bg-brown-14 text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />

        <q-toolbar-title class="flex">
          <RouterLink class="flex" to="/">
            <img class="w-10 md:w-12 object-contain brightness-0 invert" src="/yunxi-logo2.png">
            <span class="ml-2">云栖足道．SPA</span>
          </RouterLink>
        </q-toolbar-title>

        <q-fab padding="xs" icon="person" vertical-actions-align="center" direction="down" :label="(userAccout || '贵宾') + ' 您好' ">
          <q-fab-action padding="xs" v-if="userAccout" color="red" @click="logout" icon="logout" label="登出" />
          <q-fab-action padding="xs" v-if="!userAccout" color="primary" @click="logout" icon="login" label="登入" />
        </q-fab>
        <!-- <q-btn dense flat round icon="menu" @click="toggleRightDrawer" /> -->
      </q-toolbar>
      <q-toolbar inset>
        <q-breadcrumbs active-color="white" class="text-base">
          <template v-for="(page, index) in breadcrumbsStore.pageList" :key="index">
            <q-breadcrumbs-el v-if="breadcrumbsStore.pageList.length - 1 === index || page.disable" :label="page.label" :icon="page.icon"/>
            <q-breadcrumbs-el v-else v-ripple :label="page.label" :icon="page.icon" :to="page.toPath"/>
          </template>
        </q-breadcrumbs>
      </q-toolbar>

      <!-- <q-tabs align="center">
        <q-route-tab label="Page One1" />
        <q-route-tab label="Page One2" />
        <q-route-tab label="Page One3" />
        <q-route-tab label="Page One4" />
        <q-route-tab to="/page2" label="Page Two" />
        <q-route-tab to="/page3" label="Page Three" />
      </q-tabs> -->
    </q-header>

    <q-drawer show-if-above v-model="leftDrawerOpen" side="left" elevated :behavior="isMobileDrawer ? 'mobile' : 'desktop'">
      <div class="absolute top-0 left-0 w-full h-[150px]">
        <q-img class="h-[150px] absolute opacity-80" src="/room.jpeg"></q-img>
        <img class="object-contain absolute top-4 brightness-0 invert" src="/yunxi-logo2-full.png"></img>
      </div>
      <!-- <div class="q-mini-drawer-hide absolute z-50" style="top: 15px; right: -17px">
        <q-btn
          dense
          round
          unelevated
          color="accent"
          icon="chevron_left"
          @click="leftDrawerOpen = false"
        />
      </div> -->
      <q-scroll-area class="h-[calc(100%-150px)] mt-[150px]">
        <q-list>
          <template v-for="(menu, index) in menus" :key="index">
            <q-separator inset v-if="menu.isSeparator" />
            <template v-else>
              <q-item v-show="(isShowAdmin(menu.requiresAdmin) && isShowLogin(menu.requiresAuth))" v-if="menu.disable && !menu.hasChildren">
                <q-item-section avatar>
                  <q-icon size="1.5rem" :name="menu.icon"></q-icon>
                </q-item-section>
                <q-item-section>{{ menu.label }}</q-item-section>
              </q-item>
              <ExpansionTree v-show="(isShowAdmin(menu.requiresAdmin) && isShowLogin(menu.requiresAuth))" v-else-if="menu.hasChildren" :icon="menu.icon" :label="menu.label" :res="res" :menus="menu.children" />
              <q-item v-show="(isShowAdmin(menu.requiresAdmin) && isShowLogin(menu.requiresAuth))" v-else clickable v-ripple :to="{ name: menu.toName }" :active="menu.toPath === $route.path">
                <q-item-section avatar>
                  <q-icon size="1.5rem" :name="menu.icon"></q-icon>
                </q-item-section>
                <q-item-section>{{ menu.label }}</q-item-section>
              </q-item>
            </template>
          </template>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <!-- <q-drawer v-model="rightDrawerOpen" side="right" elevated>
    </q-drawer> -->

    <q-page-container>
      <q-page class="h-0">
        <q-scroll-area class="fit">
          <RouterView class="mx-auto p-1 md:p-4" :style="{ width: screenWidth + 'px' }"></RouterView>
        </q-scroll-area>
      </q-page>
    </q-page-container>

    <q-footer elevated class="bg-grey-9 text-white">
      <q-toolbar>
        <q-space></q-space>
        <label class="text-xs sm:text-sm md:text-base lg:text-lg"><strong>Copyright <q-icon class="pb-1" name="copyright"></q-icon> 2025 云栖足道．SPA</strong></label>
      </q-toolbar>
    </q-footer>

  </q-layout>
</template>
