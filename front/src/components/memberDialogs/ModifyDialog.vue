<script setup lang="ts">
import { onMounted, reactive, toRefs } from 'vue';
import { useDialogPluginComponent, useQuasar } from 'quasar';
import { put } from '@/utils/api';
import { errorMsgParse } from '@/utils/utils';
import type { IMemberData } from '@/interfaces/member';

const { dialogRef, onDialogOK, onDialogCancel } = useDialogPluginComponent();
const props = defineProps<{
    item: IMemberData;
}>();
const { item } = toRefs(props);
const $q = useQuasar();
const payload = reactive<IMemberData>({
    id: '',
    name: '',
    phone: '',
    price: '0',
    is_first: false,
    first_discount: '100',
    discount: '100'
});

onMounted(() => {
    payload.id = item.value.id;
    payload.name = item.value.name;
    payload.phone = item.value.phone;
    payload.price = item.value.price;
    payload.is_first = item.value.is_first;
    payload.first_discount = item.value.first_discount.toString();
    payload.discount = item.value.discount.toString();

    console.log(payload)
});

async function onSubmit() {
    try {
        const res = await put(`/member/${item.value.id}`, payload);
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
                <div class="text-h6">修改会员</div>
            </q-card-section>
            <q-card-section>
                <q-input lazy-rules :rules="[ val => val && val.length > 0 || '请输入姓名']" v-model="payload.name" label="姓名"></q-input>
                <q-input lazy-rules :rules="[ val => val && val.length > 0 || '请输入手机号']" v-model="payload.phone" label="手机"></q-input>
                <q-input lazy-rules :rules="[ val => val && val.length > 0 || '请输入余额']" v-model="payload.price" type="number" label="余额"></q-input>
                <q-checkbox v-model="payload.is_first" label="首单特价"></q-checkbox>
                <q-input lazy-rules :rules="[ val => val && val.length > 0 || '请输入首单特价折扣']" v-model="payload.first_discount" type="number" label="首单特价折扣"></q-input>
                <q-input lazy-rules :rules="[ val => val && val.length > 0 || '请输入会员卡折扣']" v-model="payload.discount" type="number" label="会员卡折扣"></q-input>
            </q-card-section>
            <q-card-actions align="center">
                <q-btn label="取消" class="!w-16" color="primary" @click="onDialogCancel" />
                <q-btn label="确认" class="!w-16" color="red" type="submit" />
            </q-card-actions>
        </q-form>
    </q-card>
</q-dialog>
</template>