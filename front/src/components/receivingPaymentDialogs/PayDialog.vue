<script setup lang="ts">
import type { TAddition } from '@/interfaces/clockIn';
import type { IMemberData } from '@/interfaces/member';
import type { IReceivingPaymentActionPayload, IReceivingPaymentBaseData } from '@/interfaces/receivingPayment';
import type { IServicePayPageData } from '@/interfaces/service';
import { get, put } from '@/utils/api';
import { errorMsgParse } from '@/utils/utils';
import dayjs from 'dayjs';
import { useDialogPluginComponent, useQuasar } from 'quasar';
import { onMounted, ref, toRefs } from 'vue';

interface IMemberOptions extends IMemberData {
    label: string;
}

const $q = useQuasar();
const { dialogRef, onDialogOK, onDialogCancel } = useDialogPluginComponent();
const props = defineProps<{
    itemIndex: string;
    item: IReceivingPaymentBaseData;
}>();
const { item, itemIndex } = toRefs(props);
const addition = ref<TAddition>(item.value.addition);
const servicePayID = ref<number>();
const isOtherPayPrice = ref<boolean>(false);
const isMemberCard = ref<boolean>(false);
let _memberCard: IMemberOptions[] = [];
const memberCardID = ref<string>();
const memberCards = ref<IMemberOptions[]>([]);
// 覆盖原本金额
const otherPayPrice = ref<string>();
// 额外收取金额，分润（例如: 大宝/额外小费）
const extendPrice = ref<string>('0');
// 给技师的额外金额 (例如: 美团好评)
const bonusPrice = ref<string>('0');
const discountPrice = ref<string>('0');
const desc = ref<string>('');
const servicePays = ref<Omit<IServicePayPageData, 'salary_price'>[]>([]);

onMounted(async() => {
    const servicePayRes = await get(`/service/${item.value.service!.id}/service_pays`);
    servicePays.value = servicePayRes.data.data;
    const memberCardRes = await get('/members');
    _memberCard = memberCardRes.data.data.map((v: any) => {
        v.label = `${v.name}-${v.phone}`;

        return v;
    });
    memberCards.value = [..._memberCard];
    addition.value = item.value.addition;
    onChangeServicePayID(item.value.service_pay_id);
    otherPayPrice.value = item.value.other_pay_price?.toString();
});

async function onSubmit() {
    if (isOtherPayPrice.value && (!desc.value.trim())) {
        $q.notify({
            message: '自定义付款需填写备注',
            color: 'orange',
            textColor: 'black'
        })

        return void 0;
    }

    const r = confirm('确认提交吗？');
    if (r) {
        const id = item.value?.id;
        const data: IReceivingPaymentActionPayload = {
            addition: addition.value,
            service_id: item.value.service!.id,
            service_pay_id: servicePayID.value!,
            other_pay_price: otherPayPrice.value,
            bonus_price: bonusPrice.value,
            discount_price: discountPrice.value,
            extend_price: extendPrice.value,
            desc: desc.value,
            member_id: memberCardID.value
        };

        try {
            const res = await put(`/work_record/${id}/action/pay`, data);

            onDialogOK(res);
        } catch (err: any) {
            if (err.response.data.c_state === 'member_price') {
                $q.dialog({
                    title: '支付错误信息。',
                    message: errorMsgParse(err),
                    cancel: {
                        push: true
                    },
                    ok: {
                        push: true,
                        color: 'red'
                    },
                }).onOk(async () => {
                    const diffPrice = err.response.data.data.diffPrice;
                    const r = confirm('确定使用会员卡付款部分金额，剩余使用其他支付方式？');
                    if (r) {
                        try {
                            await put(`/work_record/${id}/action/member_repay`, data);

                            $q.notify({
                                message: `支付成功, 剩余应付款金额: ${diffPrice}`,
                                color: 'yellow',
                                textColor: 'black',
                                timeout: 100000,
                                actions: [
                                    { label: '确认收款', color: 'black', handler: () => {
                                        alert(`这是最后确认，请务必确认剩余应付款金额: ${diffPrice} 完成收款?`);
                                    }}
                                ]
                            });

                            onDialogOK(true);
                        } catch (err) {
                            $q.notify({
                                message: errorMsgParse(err),
                                color: 'red',
                                timeout: 5000
                            });
                        }
                    } else {
                        $q.notify({
                            message: '取消使用会员卡支付，请记得收全款。',
                            color: 'red',
                            timeout: 50000
                        });
                    }
                }).onCancel(() => {
                    $q.notify({
                        message: '取消使用会员卡支付，请记得收全款。',
                        color: 'red',
                        timeout: 10000
                    });
                });
            } else {
                $q.notify({
                    message: errorMsgParse(err),
                    color: 'red'
                });
            }
        }
    }
}

function onChangeServicePayID(id?: number) {
    servicePayID.value = id;
    isShowMemberCards(id);
    isShowOtherPayPrice(id);
}

function isShowMemberCards(servciePayID?: number) {
    memberCardID.value =undefined;
    const _servicePay = servicePays.value.find((p) => p.id === servciePayID);
    if (_servicePay && _servicePay.can_member_card) {
        isMemberCard.value = true;
    } else {
        isMemberCard.value = false;
    }
}

function isShowOtherPayPrice(servciePayID?: number) {
    otherPayPrice.value = undefined;
    const _servicePay = servicePays.value.find((p) => p.id === servciePayID);
    if (_servicePay && _servicePay.is_write) {
        isOtherPayPrice.value = true;
    } else {
        isOtherPayPrice.value = false;
    }
}

function filterFn(val: string, update: Function) {
    if (val === '') {
        update(() => {
            memberCards.value = [..._memberCard];
        })
        return
    }

    update(() => {
        const needle = val.toLowerCase()
        memberCards.value = _memberCard.filter(v => v.label.toLowerCase().indexOf(needle) !== -1)
    })
}

</script>

<template>
    <q-dialog ref="dialogRef" persistent>
        <q-card class="w-3/4">
            <q-form greedy @submit.prevent="onSubmit">
                <q-card-section>
                    <div class="text-h6">确定收款项次:【{{ itemIndex }}】</div>
                </q-card-section>
                <q-card-section>
                    <div>技师工号: 【{{ item.worker ? item.worker.no : '' }}】</div>
                    <div>您选择的服务包间: 【{{ item.room ? item.room.name : '' }}】</div>
                    <div>服务项目: 【{{ item.service? item.service.name : '' }}】</div>
                    <div>开始时间: 【{{ item.start_time ? dayjs(item.start_time).format('YYYY-MM-DD HH:mm:ss') : '' }}】</div>
                    <div>预计结束时间: 【{{ item.end_time ? dayjs(item.end_time).format('YYYY-MM-DD HH:mm:ss') : '' }}】</div>
                    <div class="flex justify-evenly">
                        <q-radio v-model="addition" val="assign" label="点钟"/>
                        <q-radio v-model="addition" val="increase" label="加钟"/>
                        <q-radio v-model="addition" val="none" label="无"/>
                    </div>
                </q-card-section>
                <q-card-section class="q-pt-none">
                    <q-select label="付款选项" v-model="servicePayID" :rules="[val => val !== undefined || '请输入付款选项']" :options="servicePays" option-label="platform" option-value="id" emit-value map-options @update:model-value="onChangeServicePayID"></q-select>
                    <q-select v-if="isMemberCard" clearable use-input @filter="filterFn" label="会员卡" v-model="memberCardID" :options="memberCards" option-label="label" option-value="id" emit-value map-options></q-select>
                    <q-input v-if="isOtherPayPrice" lazy-rules :rules="[val => val && val.length > 0 || '请输入金额', val => val && val >= 0 || '请输入大于等于0']" type="number" v-model="otherPayPrice" label="其他金额"></q-input>
                </q-card-section>
                <q-card-section class="q-pt-none">
                    <q-input lazy-rules :rules="[val => val && val.length > 0 || '请输入金额', val => val && val >= 0 || '请输入大于等于0']" type="number" v-model="extendPrice" label="额外金额(分润)"></q-input>
                    <q-input lazy-rules :rules="[val => val && val.length > 0 || '请输入金额', val => val && val >= 0 || '请输入大于等于0']" type="number" v-model="bonusPrice" label="额外奖励金额(不分润)"></q-input>
                    <q-input lazy-rules :rules="[val => val && val.length > 0 || '请输入金额', val => val && val >= 0 || '请输入大于等于0']" type="number" v-model="discountPrice" label="优惠价格(店承担)"></q-input>
                    <q-input v-model="desc" label="备注"></q-input>
                </q-card-section>
                <q-card-actions align="center">
                    <q-btn label="取消" class="!w-16" color="primary" @click="onDialogCancel"/>
                    <q-btn label="确认" class="!w-16" color="red" type="submit" />
                </q-card-actions>
            </q-form>
        </q-card>
    </q-dialog>
</template>