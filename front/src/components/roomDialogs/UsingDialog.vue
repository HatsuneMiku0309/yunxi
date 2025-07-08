<script setup lang="ts">
import { onMounted, reactive, ref, toRefs } from 'vue';
import { useDialogPluginComponent, useQuasar } from 'quasar';
import type { IRoomPageData, IRoomExtendData, IRoomUsingPayload } from '@/interfaces/room';
import type { IServicePageData } from '@/interfaces/service';
import { convertWorkerEnumNameToCNString, EWorkerStatus, type IWorkerPageData } from '@/interfaces/worker';
import { get, put } from '@/utils/api';
import { errorMsgParse } from '@/utils/utils';

const $q = useQuasar();
const { dialogRef, onDialogOK, onDialogCancel } = useDialogPluginComponent();
const props = defineProps<{
    id: string;
    room: IRoomPageData
}>();
const { id, room } = toRefs(props);
const services = ref<Omit<IServicePageData, 'desc' | 'order' | 'price'>[]>();
const workers = ref<IWorkerPageData[]>();
const worker = ref<IWorkerPageData>();
const service = ref<Omit<IServicePageData, 'desc' | 'order' | 'price'>>();
const extneds =  ref<Partial<IRoomExtendData>[]>();
const desc = ref<string>('');
const payload = reactive<{
    desc: string;
    datas: IRoomUsingPayload[]
}>({
    desc: '',
    datas: []
});

onMounted(async () => {
    const serviceRes = await get('/services');
    const workerRes = await get('/workers');
    services.value = serviceRes.data.data;
    workers.value = workerRes.data.data;

    // 需要進行clone，否則會影響到room本身
    extneds.value = JSON.parse(JSON.stringify(room.value.extends));
});

async function onSubmit() {
    try {
        payload.desc = desc.value;
        payload.datas.push(...(extneds.value?.map((e) => ({
            work_record_id: e.work_record_id,
            worker_id: e.worker?.id,
            service_id: e.service?.id
        })) || []));

        await put(`/room/${id.value}/action/using`, payload);

        onDialogOK(true);
    } catch (err: any) {
        $q.notify({
            message: errorMsgParse(err),
            color: 'red'
        });
    }
}

function onAdd() {
    try {
        if (!worker.value) {
            throw new Error('必须选择技师。');
        }
        extneds.value?.push({
            worker: worker.value,
            service: service.value
        });

        worker.value = undefined;
        service.value = undefined;
    } catch (err: any) {
        $q.notify({
            message: errorMsgParse(err),
            color: 'red'
        });
    }
}

function onDelete(index?: number) {
    if (index === undefined) {
        extneds.value = [];
    } else {
        extneds.value?.splice(index, 1);
    }
}

</script>

<template>
<q-dialog ref="dialogRef" persistent>
    <q-card class="w-3/4">
        <q-form greedy @submit.prevent="onSubmit">
            <q-card-section>
                <div class="text-h6">包间使用:【{{ room.name }}】</div>
            </q-card-section>
            <q-card-section>
                <q-select class="p-2" v-model="worker" label="技师" :options="workers" option-label="name" option-value="id" map-options>
                    <template v-slot:option="{ itemProps, opt }">
                        <q-item v-if="![EWorkerStatus.idle, EWorkerStatus.reserve].includes(opt.status)" v-bind="itemProps">
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
                <q-select class="p-2" v-model="service" label="服务项目" :options="services" option-label="name" option-value="id" map-options>
                    <template v-slot:prepend>
                        <q-icon name="assignment" />
                    </template>
                </q-select>
                <q-card-actions align="right">
                    <q-btn fab-mini icon="add" color="primary" label="添加" @click="onAdd"/>
                </q-card-actions>
            </q-card-section>
            <q-card-section>
                <q-markup-table>
                    <thead>
                        <tr>
                            <th><q-btn class="!w-20" fab-mini icon="delete" label="清空" color="red" @click="onDelete()"/></th>
                            <th>项次</th>
                            <th>技师</th>
                            <th>服务</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(extned, index) in extneds" :key="index">
                            <td class="text-center"><q-btn class="!w-20" fab-mini icon="remove" label="删除" color="red" @click="onDelete(index)"/></td>
                            <td class="text-center">{{ index + 1 }}</td>
                            <td class="text-center">{{ extned.worker?.name }}</td>
                            <td class="text-center">{{ extned.service ? extned.service.name : '无' }}</td>
                        </tr>
                    </tbody>
                </q-markup-table>
            </q-card-section>
            <q-card-section>
                <q-input class="p-2" label="备注" v-model="desc"></q-input>
            </q-card-section>
            <q-card-actions align="center">
                <q-btn label="取消" class="!w-16" color="primary" @click="onDialogCancel" />
                <q-btn label="确认" class="!w-16" color="red" type="submit" />
            </q-card-actions>
        </q-form>
    </q-card>
</q-dialog>
</template>