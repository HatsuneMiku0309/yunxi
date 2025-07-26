<script setup lang="ts">
// 下钟不改变room status/worker/service
// 下钟清空worker status/room/service

import { computed, onMounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import type { IClockOutPageData } from '@/interfaces/clockOut';
import { EReceivingPaymentServiceStatus } from '@/interfaces/receivingPayment';
import { get, put } from '@/utils/api';
import dayjs from 'dayjs';

const $q = useQuasar();
const flashingRow = ref<number | null>(null);
const itemIndex = ref<string>();
const item = ref<IClockOutPageData>();
let itemID: number | undefined;
const list = ref<IClockOutPageData[]>([]);

onMounted(async () => {
    const workRecordRes = await get('/work_records', {
        params: {
            service_status: EReceivingPaymentServiceStatus.run
        }
    });
    list.value = workRecordRes.data.data;
})

function onClean() {
    itemIndex.value = '';
}

function onSubmit() {
    if (!itemID) {
        $q.notify({
            message: '没有选择到项次',
            color: 'red'
        });

        return void 0;
    }
    item.value = list.value.find((l) => l.id === itemID);
    if (!item.value) {
        $q.notify({
            message: '请联系管理员',
            color: 'red'
        });

        return void 0;
    }

    $q.dialog({
        title: `确定下钟【${itemIndex.value}】`,
        html: true,
        message: `
            <div>技师工号: 【${item.value.worker?.no}】</div>
            <div>您选择的服务包间: 【${item.value.room?.name}】</div>
            <div>服务项目: 【${item.value.service?.name}】</<div>
            <div>开始时间: 【${item.value.start_time}】</div>
            <div>预计结束时间: 【${item.value.end_time}】</div>
        `,
        cancel: {
            push: true
        },
        ok: {
            push: true,
            color: 'red'
        },
        persistent: true
    }).onOk(async () => {
        await put(`/work_record/${itemID}/action/clock_out`, {});

        $q.notify({
            message: '提交成功',
            color: 'green'
        });
        window.location.reload();
    });
}

function onSelect(index: number, id: number) {
    itemIndex.value = index.toString();
    itemID = id;

    flashingRow.value = index - 1;
    const timer = setTimeout(() => {
        flashingRow.value = null;
        clearTimeout(timer);
    }, 150);
}

const isNotIOSAndSafari = computed(() => !$q.platform.is.ios && !$q.platform.is.safari);


</script>

<template>
    <div>
        <q-expansion-item :default-opened="!$q.platform.is.mobile" icon="front_hand" label="操作功能" class="border my-1 rounded-md">
            <q-form greedy class="flex items-center p-2 py-4" @submit="onSubmit">
                <q-input class="w-full md:w-64" filled label="项次" v-model="itemIndex" readonly lazy-rules :rules="[val => val && val.length > 0 || '请选择项次']" />
                <div class="flex justify-end mt-2 w-full md:w-0 md:grow">
                    <q-btn label="清除" color="primary" @click="onClean"></q-btn>
                    <q-btn class="!mx-2" label="下钟" type="submit" color="red"></q-btn>
                </div>
            </q-form>
        </q-expansion-item>
        <q-markup-table class="h-150">
            <thead>
                <tr>
                    <th class="sticky top-0 z-10 bg-brown-14 text-white">项次</th>
                    <th class="sticky top-0 z-10 bg-brown-14 text-white">技师</th>
                    <th class="sticky top-0 z-10 bg-brown-14 text-white">包间号</th>
                    <th class="sticky top-0 z-10 bg-brown-14 text-white">服务项目</th>
                    <th class="sticky top-0 z-10 bg-brown-14 text-white">预计开始时间</th>
                    <th class="sticky top-0 z-10 bg-brown-14 text-white">预计结束时间</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(l, index) in list" :key="l.id" @click="onSelect(index + 1, l.id)" class="cursor-pointer relative overflow-hidden" v-ripple="isNotIOSAndSafari" :class="[!isNotIOSAndSafari ? 'transition-colors duration-150' : '', !isNotIOSAndSafari ? flashingRow === index ? 'bg-gray-300' : 'bg-white' : '']">
                    <td class="text-center">{{ index + 1 }}</td>
                    <td class="text-center">{{ l.worker?.name }}</td>
                    <td class="text-center">{{ l.room?.name }}</td>
                    <td class="text-center">{{ l.service?.name }}</td>
                    <td class="text-center">{{ l.start_time ? dayjs(l.start_time).format('YYYY-MM-DD HH:mm:ss') : '' }}</td>
                    <td class="text-center">{{ l.end_time ? dayjs(l.end_time).format('YYYY-MM-DD HH:mm:ss') : '' }}</td>
                </tr>
            </tbody>
        </q-markup-table>
    </div>
</template>