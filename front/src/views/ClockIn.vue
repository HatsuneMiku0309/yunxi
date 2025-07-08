<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { ERoomStatus, convertRoomEnumNameToCNString, type IRoomPageData } from '@interfaces/room';
import { useQuasar } from 'quasar';
import dayjs from 'dayjs';
import type { IClockInPayload, TAddition } from '@/interfaces/clockIn';
import { convertWorkerEnumNameToCNString, EWorkerStatus, type IWorkerPageData } from '@/interfaces/worker';
import type { IServicePageData } from '@/interfaces/service';
import { EReceivingPaymentServiceStatus, type IReceivingPaymentBaseData } from '@/interfaces/receivingPayment';
import { get, post } from '@/utils/api';

const $q = useQuasar();
const roomID = ref<number>();
const serviceID = ref<number>();
const workerID = ref<number>();
const addition = ref<TAddition>('none');
const rooms = ref<Omit<IRoomPageData, 'extends'>[]>();
const services = ref<Omit<IServicePageData, 'desc' | 'order' | 'price'>[]>();
const workers = ref<IWorkerPageData[]>();
const workRecords = ref<IReceivingPaymentBaseData[]>([]);
const workRecord = ref<IReceivingPaymentBaseData>();
const workRecrodId = ref<number>();
const additionOptions: {[k in TAddition]: string} = {
    assign: '点钟',
    increase: '加钟',
    none: '无'
};
const payload = reactive<IClockInPayload>({
    work_record_id: undefined,
    worker_id: undefined,
    room_id: undefined,
    service_id: undefined,
    addition: 'none'
});

onMounted(async () => {
    const roomRes = await get('/rooms');
    const serviceRes = await get('/services');
    const workerRes = await get('/workers');
    const workRecordRes = await get('/work_records', {
        params: {
            service_status: EReceivingPaymentServiceStatus.idle
        }
    });
    rooms.value = roomRes.data.data; 
    services.value = serviceRes.data.data;
    workers.value = workerRes.data.data;
    workRecords.value = workRecordRes.data.data.map((d: any) => {
        d.name = `技师:【${d.worker ? d.worker.name : ''}】-包间:【${d.room? d.room.name : ''}】-服务:【${d.service ? d.service.name : ''}】`;

        return d;
    });
});

function onClean() {
    roomID.value = undefined;
    serviceID.value = undefined;
    workerID.value = undefined;
    workRecord.value = undefined;
    workRecrodId.value = undefined;
    addition.value = 'none';
}

function onSubmit() {
    const nowDateTime = new Date();
    const findService = services.value?.find((s) => s.id === serviceID.value) || { time: 0 };
    const worker = workers.value?.find((w) => w.id === workerID.value);
    const room = rooms.value?.find((r) => r.id === roomID.value);
    const service = services.value?.find((s) => s.id === serviceID.value);
    const _addition = addition.value in additionOptions ? additionOptions[addition.value] : '无';
    $q.dialog({
        title: '确定上钟吗？',
        html: true,
        message: `
            <div>技师工号: 【${worker?.name}】</div>
            <div>您选择的服务包间: 【${room?.name}】</div>
            <div>服务项目: 【${service?.name}】</<div>
            <div><label class="text-red-600 font-bold">预计</label>服务时间: 【${findService?.time} (min)】</<div>
            <div><label class="text-red-600 font-bold">预计</label>开始时间: 【${dayjs(nowDateTime).add(1, 'minute').format('YYYY-MM-DD HH:mm')}】</div>
            <div><label class="text-red-600 font-bold">预计</label>结束时间: 【${dayjs(nowDateTime).add(1, 'minute').add(findService?.time, 'minute').format('YY-MM-DD HH:mm')}】</div>
            <div>额外选项: 【${_addition}】

            <div class="mt-4 text-red-600">《上述服务时间依据不同平台可能有所不同，请注意真实服务时间。》</div>
            <div class="text-red-600">《如有换钟，请跟柜台说，变换服务项目。》</div>
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
        // call api
        payload.work_record_id = workRecrodId.value;
        payload.worker_id = workerID.value;
        payload.room_id = roomID.value;
        payload.service_id = serviceID.value;
        payload.addition = addition.value;
        await post('/work_record/action/clock_in', payload);

        $q.notify({
            message: '提交成功',
            color: 'green'
        });

        window.location.reload();
    });
}

function onSelectWorkRecord(v?: IReceivingPaymentBaseData) {
    workRecrodId.value = v?.id;
    workerID.value = v?.worker?.id;
    roomID.value = v?.room?.id;
    serviceID.value = v?.service?.id;
    addition.value = v ? v.addition : 'none';
}
</script>

<template>
    <div>
        <q-form @submit="onSubmit" greedy class="q-pa-md">
            <q-select clearable label="上钟记录" class="p-2" v-model="workRecord" :options="workRecords" option-label="name" option-value="id" map-options @update:model-value="onSelectWorkRecord">
                <template v-slot:prepend>
                    <q-icon name="dataset" />
                </template>
            </q-select>
            <q-select lazy-rules :rules="[ val => val || '请选择技师']" class="p-2" v-model="workerID" label="技师" :options="workers" option-label="name" option-value="id" emit-value map-options>
                <template v-slot:option="{ itemProps, opt }">
                    <q-item v-bind="itemProps">
                        <q-item-section>
                            <q-item-label>
                                {{ opt.name }}【{{ convertWorkerEnumNameToCNString[EWorkerStatus[opt.status] as keyof typeof EWorkerStatus] }}】
                            </q-item-label>
                        </q-item-section>
                    </q-item>
                </template>
                <template v-slot:prepend>
                    <q-icon name="man" />
                </template>
            </q-select>
            <q-select lazy-rules :rules="[ val => val || '请选择服务包间']" class="p-2" v-model="roomID" label="上钟包间" :options="rooms" option-label="name" option-value="id" emit-value map-options>
                <template v-slot:option="{ itemProps, opt }">
                    <q-item v-bind="itemProps">
                        <q-item-section>
                            <q-item-label>
                                {{ opt.name }}【{{ convertRoomEnumNameToCNString[ERoomStatus[opt.status] as keyof typeof ERoomStatus] }}】
                            </q-item-label>
                        </q-item-section>
                    </q-item>
                </template>
                <template v-slot:prepend>
                    <q-icon name="meeting_room" />
                </template>
            </q-select>
            <q-select lazy-rules :rules="[ val => val || '请选择服务项目']" class="p-2" v-model="serviceID" label="服务项目" :options="services" option-label="name" option-value="id" emit-value map-options>
                <template v-slot:prepend>
                    <q-icon name="assignment" />
                </template>
            </q-select>
            <q-expansion-item :default-opened="!$q.platform.is.mobile" icon="add" label="额外选项" class="border my-1 rounded-md">
                <q-radio v-model="addition" val="assign" label="点钟"/>
                <q-radio v-model="addition" val="increase" label="加钟"/>
                <q-radio v-model="addition" val="none" label="无"/>
            </q-expansion-item>
            
            <div class="flex justify-evenly mt-4">
                <q-btn label="清除" type="button" color="red" @click="onClean"/>
                <q-btn label="提交" type="submit" color="primary"/>
            </div>
        </q-form>
    </div>
</template>