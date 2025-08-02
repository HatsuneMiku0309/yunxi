<script setup lang="ts">
import { convertWorkRecordStatusToCNString, EEditMode, EReceivingPaymentStatus, type IReceivingPaymentBaseData, type IReceivingPaymentCreateOrUpdatePayload } from '@/interfaces/receivingPayment';
import { convertRoomEnumNameToCNString, ERoomStatus, type IRoomPageData } from '@/interfaces/room';
import { convertWorkerEnumNameToCNString, EWorkerStatus, type IWorkerPageData } from '@/interfaces/worker';
import { ref, reactive, toRefs, onMounted, computed } from 'vue';
import { useDialogPluginComponent, useQuasar } from 'quasar';
import type { IServiceData, IServicePayPageData } from '@/interfaces/service';
import { put, get, post } from '@/utils/api';
import { errorMsgParse } from '@/utils/utils';
import type { TAddition } from '@/interfaces/clockIn';


const { dialogRef, onDialogOK, onDialogCancel } = useDialogPluginComponent();
const props = defineProps<{
    editMode: EEditMode;
    item?: IReceivingPaymentBaseData;
    itemIndex?: string;
}>();
const { editMode, item, itemIndex } = toRefs(props);

const $q = useQuasar();
const workers = ref<IWorkerPageData[]>([]);
const rooms = ref<Omit<IRoomPageData, 'extends'>[]>([]);
const services = ref<Omit<IServiceData, 'desc' | 'price'>[]>([]);
const servicePays = ref<IServicePayPageData[]>([]);
const isOtherPayPrice = ref<boolean>(false);
const statusTemp = ref<EReceivingPaymentStatus>();
const payload = reactive<IReceivingPaymentCreateOrUpdatePayload>({
    worker_id: undefined,
    room_id: undefined,
    service_id: undefined,
    service_pay_id: undefined,
    other_pay_price: undefined,
    status: EReceivingPaymentStatus.unpay,
    addition: 'none'
});

function checkPayload() {
    if (!payload.room_id && !payload.worker_id && !payload.service_id) {
        throw new Error('至少填写【技师/包间/服务】其中一项');
    }

    if ( payload.status === EReceivingPaymentStatus.payed ) {
        if (!payload.service_id) {
            throw new Error('已付款应选择服务项目');
        } else {
            if (!payload.service_pay_id) {
                throw new Error('请选择付款选项');
            }

            const servicePay = servicePays.value.find((s) => s.id === payload.service_pay_id);
            if (!servicePay) {
                throw new Error('付款选项错误，请通知管理员');
            }
            
            // show error when has servicePay is_write is true and other_pay_price is undefined or null
            if (servicePay.is_write && !payload.other_pay_price) {
                throw new Error('其他金额必须填写');
            }
        }
    }
}

async function create() {
    let result = true;
    await post(`/work_record`, payload);

    return result;
}

async function modify() {
    let result = false;
    let r = true;
    if (statusTemp.value !== payload.status) {
        r = confirm('付款状态变更，是否确定提交？');
    }
    if (r) {
        // call modify api
        await put(`/work_record/${item.value!.id}`, payload);
        result = true;
    }

    return result;
}

async function onSubmit() {
    try {
        let result = false;
        checkPayload();
        if (editMode.value === EEditMode.modify) {
            result = await modify();
        } else {
            result = await create();
        }
        if (result) {
            onDialogOK(true);
        }
    } catch (err: any) {
        $q.notify({
            message: errorMsgParse(err),
            color: 'red'
        });
    }
}

onMounted(async () => {
    const roomRes = await get('/rooms');
    const serviceRes = await get('/services');
    const workerRes = await get('/workers');
    workers.value = workerRes.data.data;
    rooms.value = roomRes.data.data;
    services.value = serviceRes.data.data;

    if (editMode.value === EEditMode.modify) {
        payload.worker_id = item.value!.worker?.id;
        payload.room_id = item.value!.room?.id;
        onChangeServiceID(item.value?.service?.id, true);
        onChangeServicePayID(item.value?.service_pay_id, true);
        statusTemp.value = item.value!.status;
        payload.status = item.value!.status;
        payload.addition = item.value!.addition;
    }
});

function onChangeServiceID(id?: number, reload: boolean = false) {
    onChangeServicePayID(null, reload);
    payload.service_id = id;
    const service = services.value.find((s) => s.id === id);
    servicePays.value = service ? service.service_pays : [];
}

function onChangeServicePayID(id?: number | null, reload: boolean = false) {
    payload.service_pay_id = id;
    isShowOtherPayPrice(id, reload);
}

function isShowOtherPayPrice(servciePayID?: number | null, reload: boolean = false) {
    const _servicePay = servicePays.value?.find((p) => p.id === servciePayID);
    if (_servicePay && _servicePay.is_write) {
        isOtherPayPrice.value = true;
        payload.other_pay_price = reload ? item.value?.other_pay_price : null;
    } else {
        isOtherPayPrice.value = false;
        payload.other_pay_price = null;
    }
}

const isDisable = computed(() => {
    return EReceivingPaymentStatus.payed === item.value?.status;
})

</script>
<template>
    <q-dialog ref="dialogRef" persistent>
        <q-card class="w-3/4">
            <q-form ref="createForm" greedy @submit.prevent="onSubmit">
                <q-card-section>
                    <div class="text-h6">{{ editMode === EEditMode.modify ? `修改项次【${itemIndex}】` : '新增' }}</div>
                </q-card-section>
                <q-card-section>
                    <q-select clearable class="p-2" v-model="payload.worker_id" label="技师" :options="workers" option-label="name" option-value="id" emit-value map-options>
                        <template v-slot:option="{ itemProps, opt }">
                            <q-item v-if="![EWorkerStatus.idle, EWorkerStatus.reserve].includes(opt.status)" v-bind="itemProps" class="bg-red">
                                <q-item-section>
                                    <q-item-label>
                                        {{ opt.name }}【{{ convertWorkerEnumNameToCNString[EWorkerStatus[opt.status] as keyof typeof EWorkerStatus] }}】
                                    </q-item-label>
                                </q-item-section>
                            </q-item>
                            <q-item v-else v-bind="itemProps">
                                <q-item-section>
                                    <q-item-label>
                                        {{ opt.name }}{{ opt.status === EWorkerStatus.reserve ? `【${ convertWorkerEnumNameToCNString[EWorkerStatus[opt.status] as keyof typeof EWorkerStatus] }】` : ''}}
                                    </q-item-label>
                                </q-item-section>
                            </q-item>
                        </template>
                        <template v-slot:prepend>
                            <q-icon name="man" />
                        </template>
                    </q-select>
                    <q-select clearable class="p-2" v-model="payload.room_id" label="上钟包间" :options="rooms" option-label="name" option-value="id" emit-value map-options>
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
                    <q-select clearable :disable="isDisable" class="p-2" v-model="payload.service_id" label="服务项目" :options="services" option-label="name" option-value="id" emit-value map-options @update:model-value="onChangeServiceID">
                        <template v-slot:prepend>
                            <q-icon name="assignment" />
                        </template>
                    </q-select>
                    <q-select clearable :disable="isDisable" class="p-2" v-model="payload.service_pay_id" :options="servicePays" label="付款选项" option-label="platform" option-value="id" emit-value map-options @update:model-value="onChangeServicePayID"></q-select>
                    <q-input :disable="isDisable" class="p-2" v-if="isOtherPayPrice" lazy-rules :rules="[val => val && val.length > 0 || '请输入金额', val => val && val >= 0 || '请输入大于等于0']" type="number" v-model="payload.other_pay_price" label="其他金额"></q-input>
                    <div class="flex justify-evenly">
                        <q-radio v-model="payload.addition" val="assign" label="点钟"/>
                        <q-radio v-model="payload.addition" val="increase" label="加钟"/>
                        <q-radio v-model="payload.addition" val="none" label="无"/>
                    </div>
                    <div class="flex justify-evenly">
                        <q-radio :disable="isDisable" v-model="payload.status" :val="EReceivingPaymentStatus.unpay" :label="convertWorkRecordStatusToCNString[EReceivingPaymentStatus[EReceivingPaymentStatus.unpay] as keyof typeof EReceivingPaymentStatus]"/>
                        <q-radio :disable="isDisable" v-model="payload.status" :val="EReceivingPaymentStatus.payed" :label="convertWorkRecordStatusToCNString[EReceivingPaymentStatus[EReceivingPaymentStatus.payed] as keyof typeof EReceivingPaymentStatus]"/>
                    </div>
                </q-card-section>
                <q-card-actions align="center">
                    <q-btn label="取消" class="!w-16" color="primary" @click="onDialogCancel" />
                    <q-btn label="确认" class="!w-16" color="red" type="submit" />
                </q-card-actions>
            </q-form>
        </q-card>
    </q-dialog>
</template>