<script setup lang="ts">
import type { IMenuData } from '@/router';
import { toRefs } from 'vue';

const props = defineProps<{
    menus: IMenuData[],
    icon?: string,
    label?: string,
    res: undefined | { data: { data: { is_admin: boolean }} }
}>();
const { menus, icon, label, res } = toRefs(props);

function isShowLogin(isAuth?: boolean) {
  
  return isAuth ? !!res.value : true;
}

function isShowAdmin(isAdmin?: boolean) {
  
  return isAdmin ? res.value ? res.value.data.data.is_admin : false : true;
}

</script>

<template>
    <q-expansion-item :icon="icon" :label="label">
        <q-item>
            <q-item-section>
                <q-list>
                <template v-for="(menu, index) in menus" :key="index">
                    <q-separator inset v-if="menu.isSeparator" />
                    <template v-else>
                    <q-item v-show="(isShowAdmin(menu.requiresAdmin) && isShowLogin(menu.requiresAuth))" v-if="menu.disable">
                        <q-item-section avatar>
                        <q-icon size="1.5rem" :name="menu.icon"></q-icon>
                        </q-item-section>
                        <q-item-section>{{ menu.label }}</q-item-section>
                    </q-item>
                    <expansion-tree v-else-if="menu.hasChildren" :menus="menu.children" :res="res" />
                    <q-item v-show="(isShowAdmin(menu.requiresAdmin) && isShowLogin(menu.requiresAuth))" v-else clickable v-ripple :to="{ name: menu.toName }" :active="menu.toPath === $route.path">
                        <q-item-section avatar>
                        <q-icon size="1.5rem" :name="menu.icon"></q-icon>
                        </q-item-section>
                        <q-item-section>{{ menu.label }}</q-item-section>
                    </q-item>
                    </template>
                </template>
                </q-list>
            </q-item-section>
        </q-item>
    </q-expansion-item>
</template>