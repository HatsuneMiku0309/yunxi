<script setup lang="ts">
import { useDialogPluginComponent, useQuasar } from 'quasar';
import { post } from '@/utils/api';
import { errorMsgParse } from '@/utils/utils';
import { reactive } from 'vue';

const { dialogRef, onDialogOK, onDialogCancel } = useDialogPluginComponent();
const $q = useQuasar();
const payload = reactive({
    name: '',
    phone: '',
    price: null
});

async function onSubmit() {
    try {
        const res = await post(`/member`, payload);
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
                <div class="text-h6">新增会员</div>
            </q-card-section>
            <q-card-section>
                <q-input lazy-rules :rules="[ val => val && val.length > 0 || '请输入姓名']" v-model="payload.name" label="姓名"></q-input>
                <q-input lazy-rules :rules="[ val => val && val.length > 0 || '请输入手机号']" v-model="payload.phone" label="手机"></q-input>
                <q-input lazy-rules :rules="[ val => val && val.length > 0 || '请输入余额']" v-model="payload.price" type="number" label="余额"></q-input>
            </q-card-section>
            <q-card-actions align="center">
                <q-btn label="取消" class="!w-16" color="primary" @click="onDialogCancel" />
                <q-btn label="确认" class="!w-16" color="red" type="submit" />
            </q-card-actions>
        </q-form>
    </q-card>
</q-dialog>
</template>