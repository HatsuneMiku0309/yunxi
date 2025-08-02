<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef } from 'vue';
import { useQuasar } from 'quasar';
import { convertWorkRecordServiceStatsuToCNString, convertWorkRecordStatusToCNString, EEditMode, EPayMode, EReceivingPaymentServiceStatus, EReceivingPaymentStatus, type IReceivingPaymentBaseData } from '@/interfaces/receivingPayment';
import CreateDialog from '@components/receivingPaymentDialogs/CreateDialog.vue';
import CancelDialog from '@/components/receivingPaymentDialogs/CancelDialog.vue';
import PayDialog from '@/components/receivingPaymentDialogs/PayDialog.vue';
import { get } from '@utils/api';
import dayjs from 'dayjs';
import { EAddtionToCNString } from '@/interfaces/clockIn';

const $q = useQuasar();
const form = useTemplateRef<HTMLFormElement>('form');
const flashingRow = ref<number | null>(null);
const itemIndex = ref<string>();
const item = ref<IReceivingPaymentBaseData>();
const actionMode = ref<EPayMode>();
const editMode = ref<EEditMode>();
const itemID = ref<number>();
const list = ref<IReceivingPaymentBaseData[]>();

async function loadData() {
    const workRecordRes = await get('/work_records');
    list.value = workRecordRes.data.data;
}

onMounted(async () => {
    loadData();
});

function onClean() {
    itemIndex.value = undefined;
    item.value = undefined;
    itemID.value = undefined;
    actionMode.value = undefined;
}

function onSubmit() {
    if (!itemID) {
        $q.notify({
            message: '没有选择到项次',
            color: 'red'
        });

        return void 0;
    }
    item.value = list.value?.find((l) => l.id === itemID.value);
    if (!item.value) {
        $q.notify({
            message: '请联系管理员',
            color: 'red'
        });

        return void 0;
    }
    
    if (actionMode.value === EPayMode.pay) {
        if (!item.value.service) {
            $q.notify({
                message: `【${itemIndex.value}】没有服务项目，无法进行付款！`,
                color: 'red'
            });
        } else {
            $q.dialog({
                component: PayDialog,
                componentProps: {
                    itemIndex: itemIndex.value,
                    item: item.value
                }
            }).onOk(() => {
                loadData();
            }).onDismiss(() => {
                onClean();
            });
        }
    } else if (actionMode.value === EPayMode.cancel) {
        $q.dialog({
            component: CancelDialog,
            componentProps: {
                item: item.value,
                itemIndex: itemIndex.value
            }
        }).onOk(() => {
            window.location.reload();
        }).onDismiss(() => {
            onClean();
        });
    } else if (editMode.value === EEditMode.modify) {
        $q.dialog({
            component: CreateDialog,
            componentProps: {
                editMode: editMode.value,
                item: item.value,
                itemIndex: itemIndex.value
            }
        }).onOk(() => {
            window.location.reload();
        }).onDismiss(() => {
            onClean();
        });
    }
}

function onSelect(index: number, id: number) {
    itemIndex.value = index.toString();
    itemID.value = id;

    flashingRow.value = index - 1;
    const timer = setTimeout(() => {
        flashingRow.value = null;
        clearTimeout(timer);
    }, 150);
}

function onAction(action: EPayMode) {
    actionMode.value = action;
    form.value?.submit();
}

function onEdit(edit: EEditMode) {
    if (edit === EEditMode.modify) {
        editMode.value = edit;
        form.value?.submit();
    } else if (edit === EEditMode.create) {
        $q.dialog({
            component: CreateDialog,
            componentProps: {
                editMode: edit
            }
        }).onOk(() => {
            window.location.reload();
        }).onDismiss(() => {
            onClean();
        });
    }
}

const isNotIOSAndSafari = computed(() => !$q.platform.is.ios && !$q.platform.is.safari);
</script>

<template>
    <div>
        <q-expansion-item :default-opened="!$q.platform.is.mobile" icon="front_hand" label="操作功能" class="border my-1 rounded-md">
            <q-form ref="form" greedy class="flex items-center p-2 py-4" @submit="onSubmit">
                <q-input class="w-full md:w-64" filled label="项次" v-model="itemIndex" lazy-rule :rules="[val => val && val.length > 0 || '请选择项次']" readonly />
                <div class="flex justify-end mt-2 w-full md:w-0 md:grow">
                    <q-btn label="清除" color="primary" @click="onClean"></q-btn>
                    <q-btn-dropdown class="!mx-2" color="red" label="操作">
                        <q-list>
                            <q-item clickable v-close-popup v-ripple @click="onAction(EPayMode.pay)">
                                <q-item-section>
                                    <q-item-label>
                                        收款
                                    </q-item-label>
                                </q-item-section>
                            </q-item>
                            <q-item clickable v-close-popup v-ripple @click="onAction(EPayMode.cancel)">
                                <q-item-section>
                                    <q-item-label>
                                        取消
                                    </q-item-label>
                                </q-item-section>
                            </q-item>
                        </q-list>
                    </q-btn-dropdown>
                    <q-btn-dropdown class="!mx-2" color="orange" label="编辑">
                        <q-list>
                            <q-item clickable v-close-popup v-ripple @click="onEdit(EEditMode.create)">
                                <q-item-section>
                                    <q-item-label>
                                        新增
                                    </q-item-label>
                                </q-item-section>
                            </q-item>
                            <q-item clickable v-close-popup v-ripple @click="onEdit(EEditMode.modify)">
                                <q-item-section>
                                    <q-item-label>
                                        修改
                                    </q-item-label>
                                </q-item-section>
                            </q-item>
                        </q-list>
                    </q-btn-dropdown>
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
                    <th class="sticky top-0 z-10 bg-brown-14 text-white">服务状态</th>
                    <th class="sticky top-0 z-10 bg-brown-14 text-white">订单状态</th>
                    <th class="sticky top-0 z-10 bg-brown-14 text-white">点/加</th>
                    <th class="sticky top-0 z-10 bg-brown-14 text-white">开始时间</th>
                    <th class="sticky top-0 z-10 bg-brown-14 text-white">预计结束时间</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(l, index) in list" :key="l.id" @click="onSelect(index + 1, l.id)" class="cursor-pointer relative overflow-hidden" v-ripple="isNotIOSAndSafari" :class="[!isNotIOSAndSafari ? 'transition-colors duration-150' : '', !isNotIOSAndSafari ? flashingRow === index ? 'bg-gray-300' : 'bg-white' : '']">
                    <td>{{ index + 1 }}</td>
                    <td>{{ l.worker ? l.worker.name : '无' }}</td>
                    <td>{{ l.room ? l.room.name : '无' }}</td>
                    <td>{{ l.service ? l.service.name : '无' }}</td>
                    <td>{{ convertWorkRecordServiceStatsuToCNString[EReceivingPaymentServiceStatus[l.service_status] as keyof typeof EReceivingPaymentServiceStatus] }}</td>
                    <td>{{ convertWorkRecordStatusToCNString[EReceivingPaymentStatus[l.status] as keyof typeof EReceivingPaymentStatus] }}</td>
                    <td>{{ EAddtionToCNString[l.addition] || '未知' }}</td>
                    <td>{{ l.start_time ? dayjs(l.start_time).format('YYYY-MM-DD HH:mm:ss') : '' }}</td>
                    <td>{{ l.end_time ? dayjs(l.end_time).format('YYYY-MM-DD HH:mm:ss') : '' }}</td>
                </tr>
            </tbody>
        </q-markup-table>
    </div>
</template>