<script setup lang="ts">
// import LeaveDialog from '@/components/workerDialogs/LeaveDialog.vue';
// import WorkingDialog from '@/components/workerDialogs/WorkingDialog.vue';
import { get, put } from '@/utils/api';
import { errorMsgParse } from '@/utils/utils';
import { convertWorkerEnumNameToCNString, EWorkerStatus, workerStatusShowColor, type IWorkerPageData } from '@interfaces/worker';
import { useQuasar } from 'quasar';
import { onMounted, ref, useTemplateRef } from 'vue';

const $q = useQuasar();
const form = useTemplateRef<HTMLFormElement>('form');
const workerID = ref<string>();
const workerName = ref<string>();
const worker = ref<IWorkerPageData>();
const actionMode = ref<EWorkerStatus>();
const workers = ref<IWorkerPageData[]>();

onMounted(async () => {
    const workerRes = await get('/workers');
    workers.value = workerRes.data.data;
});

function onClean() {
    workerID.value = undefined;
    workerName.value = undefined;
    worker.value = undefined;
}

function onSelect (_worker: IWorkerPageData) {
    workerID.value = _worker.id.toString();
    workerName.value = _worker.name;
    worker.value = _worker;
    actionMode.value = undefined;
}

function checkWorkerID() {
    if (!workerID.value) {
        throw new Error('请选择技师');
    }
}

async function onSubmit() {
    try {
        checkWorkerID();
        await actionFun[actionMode.value!]();
        window.location.reload();
    } catch (err :any) {
        $q.notify({
            message: errorMsgParse(err),
            color: 'red'
        });
    }
}

async function actionIdle() {
    // call idle api
    await put(`/worker/${workerID.value}/action/idle`, {});
}

// function actionWorking() {
//     // show dialog
//     $q.dialog({
//         component: WorkingDialog,
//         componentProps: {
//             id: workerID.value,
//             worker: worker.value
//         }
//     }).onOk((d) => {
//         console.log(d);
//     }).onDismiss(() => {
//         onClean();
//     })
// }

async function actionReserve() {
    // call reserve api
    await put(`/worker/${workerID.value}/action/reserve`, {});
}

async function actionBreak() {
    // call break api
    await put(`/worker/${workerID.value}/action/break`, {});
}

async function actionLeave() {
    await put(`/worker/${workerID.value}/action/leave`, {});
    // $q.dialog({
    //     component: LeaveDialog,
    //     componentProps: {
    //         id: workerID.value,
    //         worker: worker.value
    //     }
    // }).onOk((d) => {
    //     console.log(d);
    // }).onDismiss(() => {
    //     onClean();
    // })
    // show dialog
    // select date
}


const actionFun = {
    [EWorkerStatus.idle]: actionIdle,
    [EWorkerStatus.working]: () => {},
    [EWorkerStatus.reserve]: actionReserve,
    [EWorkerStatus.break]: actionBreak,
    [EWorkerStatus.leave]: actionLeave,
};

function onAction(action: EWorkerStatus) {
    actionMode.value = action;
    form.value?.submit();
}

</script>

<template>
    <div>
        <q-expansion-item :default-opened="!$q.platform.is.mobile" icon="front_hand" label="操作功能" class="border my-1 rounded-md">
            <q-form ref="form" greedy class="flex items-center p-2 py-4" @submit="onSubmit">
                <q-input class="w-full md:w-64" filled label="技师" v-model="workerName" lazy-rule :rules="[val => val && val.length > 0 || '请选择卡片']" readonly />
                <div class="flex justify-end mt-2 w-full md:w-0 md:grow">
                    <q-btn color="primary" label="清除" @click="onClean"></q-btn>
                    <q-btn-dropdown class="!mx-2" color="red" label="操作">
                        <q-list>
                            <q-item clickable v-close-popup v-ripple @click="onAction(EWorkerStatus.idle)">
                                <q-item-section>
                                    <q-item-label>
                                        {{ convertWorkerEnumNameToCNString[EWorkerStatus[EWorkerStatus.idle] as keyof typeof EWorkerStatus] }}
                                    </q-item-label>
                                </q-item-section>
                            </q-item>
                            <q-item v-if="false" clickable v-close-popup v-ripple @click="onAction(EWorkerStatus.working)">
                                <q-item-section>
                                    <q-item-label>
                                        {{ convertWorkerEnumNameToCNString[EWorkerStatus[EWorkerStatus.working] as keyof typeof EWorkerStatus] }}
                                    </q-item-label>
                                </q-item-section>
                            </q-item>
                            <q-item clickable v-close-popup v-ripple @click="onAction(EWorkerStatus.reserve)">
                                <q-item-section>
                                    <q-item-label>
                                        {{ convertWorkerEnumNameToCNString[EWorkerStatus[EWorkerStatus.reserve] as keyof typeof EWorkerStatus] }}
                                    </q-item-label>
                                </q-item-section>
                            </q-item>
                            <q-item clickable v-close-popup v-ripple @click="onAction(EWorkerStatus.break)">
                                <q-item-section>
                                    <q-item-label>
                                        {{ convertWorkerEnumNameToCNString[EWorkerStatus[EWorkerStatus.break] as keyof typeof EWorkerStatus] }}
                                    </q-item-label>
                                </q-item-section>
                            </q-item>
                            <q-item clickable v-close-popup v-ripple @click="onAction(EWorkerStatus.leave)">
                                <q-item-section>
                                    <q-item-label>
                                        {{ convertWorkerEnumNameToCNString[EWorkerStatus[EWorkerStatus.leave] as keyof typeof EWorkerStatus] }}
                                    </q-item-label>
                                </q-item-section>
                            </q-item>
                        </q-list>
                    </q-btn-dropdown>
                </div>
            </q-form>
        </q-expansion-item>
        <div class="flex">
            <q-intersection v-for="(worker, index) in workers" :key="index" class="w-1/2 sm:w-1/3 lg:w-1/4" transition="scale" once>
                <q-card flat bordered class="q-ma-sm" @click="onSelect(worker)" :class="{ '!border-2 !border-blue-500': workerID === worker.id.toString() }">
                    <img src="/00007-461782023-s.png">
                    
                    <q-card-section class="q-pt-xs">
                        <q-badge :color="workerStatusShowColor[worker.status]" :label="convertWorkerEnumNameToCNString[EWorkerStatus[worker.status] as keyof typeof EWorkerStatus]" />
                        <div class="text-h6">{{ worker.name }}</div>
                    </q-card-section>
                    <q-card-section class="q-pt-none">
                        <div class="text-caption text-gray-400">
                            {{ worker.room?.name }}{{ worker.service ? `(${worker.service.name})` : '' }}
                        </div>
                    </q-card-section>
                </q-card>
            </q-intersection>
        </div>
    </div>
</template>