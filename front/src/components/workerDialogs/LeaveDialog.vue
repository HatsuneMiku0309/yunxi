<script setup lang="ts">
import { reactive, ref, toRefs } from 'vue';
import { useDialogPluginComponent, useQuasar } from 'quasar';
import type { IWorkerLeavePayload, IWorkerPageData } from '@/interfaces/worker';
import dayjs from 'dayjs';
import { errorMsgParse } from '@/utils/utils';
const { dialogRef, onDialogOK, onDialogCancel } = useDialogPluginComponent();
const props = defineProps<{
    id: string;
    worker: IWorkerPageData;
}>();
const { id: _id, worker } = toRefs(props);
const toDay = new Date();
const nextDay = dayjs(toDay).subtract(12, 'hour').add(1, 'day').format('YYYY-MM-DD');
const leaveDate = ref<string>(nextDay);
const payload = reactive<IWorkerLeavePayload>({
    leaveDate: undefined,
    desc: ''
});
const $q = useQuasar();

function onSubmit() {
    try {
        payload.leaveDate = leaveDate.value;
        // call leave api
        onDialogOK(true);
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
                <div class="text-h6">技师:【{{ worker.name }}】</div>
            </q-card-section>
            <q-card-section class="flex flex-col items-center">
                <q-input label="休假日期" type="date" v-model="leaveDate" class="w-full md:w-64" @keydown.prevent inputmode="none"/>
                <q-input class="mt-2 w-full md:w-64" label="备注" v-model="payload.desc"></q-input>
            </q-card-section>
            <q-card-actions align="center">
                <q-btn label="取消" class="!w-16" color="primary" @click="onDialogCancel" />
                <q-btn label="确认" class="!w-16" color="red" type="submit" />
            </q-card-actions>
        </q-form>
    </q-card>
</q-dialog>
</template>