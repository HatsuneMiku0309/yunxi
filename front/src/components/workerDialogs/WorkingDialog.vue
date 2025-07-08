<script setup lang="ts">
import { onMounted, reactive, ref, toRefs } from 'vue';
import { useDialogPluginComponent, useQuasar } from 'quasar';
import type { IWorkerPageData, IWorkerWorkingPayload } from '@/interfaces/worker';
import { convertRoomEnumNameToCNString, ERoomStatus, type IRoomPageData } from '@/interfaces/room';
import type { IServicePageData } from '@/interfaces/service';
import { get } from '@/utils/api';
import { errorMsgParse } from '@/utils/utils';
const { dialogRef, onDialogOK, onDialogCancel } = useDialogPluginComponent();
const props = defineProps<{
    id: string;
    worker: IWorkerPageData;
}>();
const { id: _id, worker } = toRefs(props);
const rooms = ref<IRoomPageData[]>([]);
const services = ref<Omit<IServicePageData, 'desc' | 'order' | 'price'>[]>([]);
const payload = reactive<IWorkerWorkingPayload>({
    room_id: worker.value.room?.id,
    service_id: worker.value.service?.id
});
const $q = useQuasar();

onMounted(async () => {
    const roomRes = await get('/rooms');
    const serviceRes = await get('/services');
    rooms.value = roomRes.data.data;
    services.value = serviceRes.data.data;
})

function onSubmit() {
    try {
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
            <q-card-section>
                <q-select clearable class="p-2" v-model="payload.room_id" label="上钟包间" :options="rooms" option-label="name" option-value="id" emit-value map-options>
                    <template v-slot:option="{ itemProps, opt }">
                        <q-item v-if="![ERoomStatus.idle, ERoomStatus.reserve].includes(opt.status)" v-bind="itemProps">
                            <q-item-section>
                                <q-item-label>
                                    {{ opt.name }}【{{ convertRoomEnumNameToCNString[ERoomStatus[opt.status] as keyof typeof ERoomStatus] }}】
                                </q-item-label>
                            </q-item-section>
                        </q-item>
                        <q-item v-else v-bind="itemProps">
                            <q-item-section>
                                <q-item-label>
                                    {{ opt.name }}{{ opt.status === ERoomStatus.reserve ? `【${ convertRoomEnumNameToCNString[ERoomStatus[opt.status] as keyof typeof ERoomStatus] }】` : ''}}
                                </q-item-label>
                            </q-item-section>
                        </q-item>
                    </template>
                    <template v-slot:prepend>
                        <q-icon name="meeting_room" />
                    </template>
                </q-select>
                <q-select clearable class="p-2" v-model="payload.service_id" label="服务项目" :options="services" option-label="name" option-value="id" emit-value map-options>
                    <template v-slot:prepend>
                        <q-icon name="assignment" />
                    </template>
                </q-select>
            </q-card-section>
            <q-card-actions align="center">
                <q-btn label="取消" class="!w-16" color="primary" @click="onDialogCancel" />
                <q-btn label="确认" class="!w-16" color="red" type="submit" />
            </q-card-actions>
        </q-form>
    </q-card>
</q-dialog>
</template>