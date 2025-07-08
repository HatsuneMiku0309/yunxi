<script setup lang="ts">
import type { ISettingBaseSetting, ISettingPlatform } from '@/interfaces/setting';
import { get, put } from '@/utils/api';
import { errorMsgParse } from '@/utils/utils';
import { useQuasar } from 'quasar';
import { onMounted, reactive } from 'vue';

const $q = useQuasar();
const payload = reactive<{
    base_settings: ISettingBaseSetting[]
    platforms: ISettingPlatform[]
}>({
    base_settings: [],
    platforms: []
})

onMounted(async () => {
    const res = await get('/settings');
    const {
        base_settings,
        platforms
    } = res.data.data;
    payload.base_settings = base_settings;
    payload.platforms = platforms;
});

async function onSubmit() {
    try {
        await put('/setting', { ...payload });
        $q.notify({
            message: '提交成功',
            color: 'green'
        });
        setTimeout(() => {
            window.location.reload();
        }, 500);
    } catch (err) {
        $q.notify({
            message: errorMsgParse(err),
            color: 'red'
        })
    }
}
</script>
<template>
    <div class="q-pa-md">
        <q-form greedy @submit.prevent="onSubmit">
            <q-expansion-item :default-opened="!$q.platform.is.mobile" icon="apps" label="基础设定" class="border my-2 p-2 rounded-md">
                <q-input v-for="baseSetting in payload.base_settings"
                    lazy-rules
                    :rules="[ val => val && val.length > 0 || '请输入数字']"
                    v-model="baseSetting.value"
                    type="number"
                    :label="baseSetting.value_str">
                </q-input>
            </q-expansion-item>
            <q-expansion-item :default-opened="!$q.platform.is.mobile" icon="apps" label="平台抽成" class="border my-2 p-2 rounded-md">
                <q-input v-for="(platformCommission, index) in payload.platforms" :key="index" v-model="platformCommission.commission" :label="platformCommission.cn_name + '(%)'"></q-input>
            </q-expansion-item>
            <!-- <q-card-actions align="right"> -->
            <q-page-sticky position="bottom-right" :offset="[20, 0]">
                <q-btn color="primary" label="提交" type="submit"></q-btn>
            </q-page-sticky>
            <!-- </q-card-actions> -->
        </q-form>
    </div>
</template>