<script setup lang="ts">
import type { IReceivingPaymentBaseData } from '@/interfaces/receivingPayment';
import { toRefs } from 'vue';
import { useDialogPluginComponent, useQuasar } from 'quasar';
import dayjs from 'dayjs';
import { put } from '@/utils/api';
import { errorMsgParse } from '@/utils/utils';

const { dialogRef, onDialogOK, onDialogCancel } = useDialogPluginComponent();
const props = defineProps<{
    item: IReceivingPaymentBaseData;
    itemIndex: string;
}>();
const { item, itemIndex } = toRefs(props);
const $q = useQuasar();

async function onSubmit() {
    try {
        const res = await put(`/work_record/${item.value.id}/action/cancel`, {});
        onDialogOK(res);
    } catch (err: any) {
        $q.notify({
            message: errorMsgParse(err),
            color: 'red'
        });
    }
}

</script>
<template>
<q-dialog ref="dialogRef" persistent>
    <q-card class="w-3/4">
        <q-form greedy @submit.prevent="onSubmit">
            <q-card-section>
                <div class="text-h6">确定取消项次:【{{ itemIndex }}】</div>
            </q-card-section>
            <q-card-section>
                <div>技师工号: 【{{ item.worker ? item.worker.no : '' }}】</div>
                <div>您选择的服务包间: 【{{ item.room ? item.room.name : '' }}】</div>
                <div>服务项目: 【{{ item.service ? item.service.name : '' }}】</div>
                <div>开始时间: 【{{ item.start_time ? dayjs(item.start_time).format('YYYY-MM-DD HH:mm:ss') : '' }}】</div>
                <div>预计结束时间: 【{{ item.end_time ? dayjs(item.end_time).format('YYYY-MM-DD HH:mm:ss') : '' }}】</div>
            </q-card-section>
            <q-card-actions align="center">
                <q-btn label="取消" class="!w-16" color="primary" @click="onDialogCancel" />
                <q-btn label="确认" class="!w-16" color="red" type="submit" />
            </q-card-actions>
        </q-form>
    </q-card>
</q-dialog>
</template>