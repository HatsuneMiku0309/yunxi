<script setup lang="ts">
import CreateDialog from '@/components/memberDialogs/CreateDialog.vue';
import ModifyDialog from '@/components/memberDialogs/ModifyDialog.vue';
import { EMemberAction, type IMemberData } from '@/interfaces/member';
import { get, put } from '@/utils/api';
import { errorMsgParse } from '@/utils/utils';
import { useQuasar } from 'quasar';
import { computed, onMounted, ref, useTemplateRef } from 'vue';

const $q = useQuasar();
const query = ref<string>();
const list = ref<IMemberData[]>([]);
const selectID = ref<string>();
const selectItem = ref<IMemberData>();
const flashingRow = ref<string | null>(null);
const actionMode = ref<EMemberAction>();
const form = useTemplateRef<HTMLFormElement>('form');
const price = ref<string>();
const isFirst = ref<boolean>(false);


async function loadDatas() {
    const memberRes = await get('/members');
    list.value = memberRes.data.data;
}

onMounted(async () => {
    await loadDatas();
})

async function onSubmit() {
    const memberRes = await get('/members', { params: { q: query.value } });
    list.value = memberRes.data.data;
}

async function onActionSubmit() {
    await memberAction[actionMode.value as EMemberAction]();
}

async function payMoney() {
    try {
        await put(`/member/${selectID.value}/pay_money`, { price: price.value });
        $q.notify({
            message: '付款成功！',
            color: 'green'
        });

        onClean();
        loadDatas();
    } catch (err: any) {
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
                    await put(`/member/${selectID.value}/pay_all`, { });

                    $q.notify({
                        message: `支付成功, 剩余应付款金额: ${diffPrice}`,
                        color: 'yellow',
                        textColor: 'black',
                        timeout: 100000,
                        actions: [
                            { label: '确认收款', color: 'black', handler: () => {
                                alert(`这是最后确认，请务必确认剩余应付款金额: ${diffPrice} 完成收款?`);
                            } }
                        ]
                    });
                    onClean();
                    loadDatas();
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
    }
}

async function rechargeCard() {
    try {
        await put(`/member/${selectID.value}/recharge_card`, { price: price.value, is_first: isFirst.value });
        $q.notify({
            message: '充值成功！',
            color: 'green'
        });

        onClean();
        loadDatas();
    } catch (err) {
        $q.notify({
            message: errorMsgParse(err),
            color: 'red',
            timeout: 5000
        });
    }
}

async function create() {
    $q.dialog({
        component: CreateDialog
    }).onOk(() => {
        onClean();
        loadDatas();
    });
}

async function modify() {
    if (!selectID.value) {
        $q.notify({
            message: '请选择会员',
            color: 'red' 
        });
    } else {
        $q.dialog({
            component: ModifyDialog,
            componentProps: {
                item: selectItem.value
            }
        }).onOk(() => {
            onClean();
            loadDatas();
        })
    }
}

const memberAction = {
    [EMemberAction.pay_money]: payMoney,
    [EMemberAction.recharge_card]: rechargeCard,
    [EMemberAction.create]: create,
    [EMemberAction.modify]: modify
}

function OnSelect(id: string, l: IMemberData) {
    selectID.value = id;
    selectItem.value = l;

    flashingRow.value = id;
    const timer = setTimeout(() => {
        flashingRow.value = null;
        clearTimeout(timer);
    }, 150);
}

function onClean() {
    selectID.value = undefined;
    selectItem.value = undefined;
    actionMode.value = undefined;
    price.value = undefined;
    isFirst.value = false;
}

function onAction(action: EMemberAction) {
    actionMode.value = action;
    form.value?.submit();
}

function onEdit(action: EMemberAction) {
    actionMode.value = action;
    memberAction[actionMode.value]();
}

const isNotIOSAndSafari = computed(() => !$q.platform.is.ios && !$q.platform.is.safari);
</script>

<template>
    <div>
    <!-- <div ref="container"> -->
        <q-expansion-item :default-opened="!$q.platform.is.mobile" icon="front_hand" label="操作功能" class="border my-1 rounded-md">
            <!-- 扣款/首充状态改变 -->
             <q-form ref="form" greedy class="flex items-center p-2 py-4" @submit="onActionSubmit">
                <div class="flex flex-col">
                    <div>
                        <q-input class="w-full md:w-74" filled label="会员ID" v-model="selectID" lazy-rule :rules="[val => val && val.length > 0 || '请选择会员']" readonly />
                    </div>
                    <div class="flex">
                        <q-input :readonly="!selectID" class="w-full md:w-74" type="number" filled label="金额" v-model="price" lazy-rule :rules="[val => val && val.length > 0 || '请输入金额']" />
                        <q-checkbox :disable="!selectID" v-model="isFirst" label="首充值"></q-checkbox>
                    </div>
                </div>
                <div class="flex justify-end mt-2 w-full md:w-0 md:grow">
                    <q-btn color="primary" label="清除" @click="onClean"></q-btn>
                    <q-btn-dropdown class="!mx-2" color="red" label="操作">
                        <q-list>
                            <q-item clickable v-close-popup v-ripple @click="onAction(EMemberAction.pay_money)">
                                <q-item-section>
                                    <q-item-label>
                                        付款
                                    </q-item-label>
                                </q-item-section>
                            </q-item>
                            <q-item clickable v-close-popup v-ripple @click="onAction(EMemberAction.recharge_card)">
                                <q-item-section>
                                    <q-item-label>
                                        充值
                                    </q-item-label>
                                </q-item-section>
                            </q-item>
                        </q-list>
                    </q-btn-dropdown>
                    <q-btn-dropdown class="!mx-2" color="orange" label="编辑">
                        <q-list>
                            <q-item clickable v-close-popup v-ripple @click="onEdit(EMemberAction.create)">
                                <q-item-section>
                                    <q-item-label>
                                        新增会员
                                    </q-item-label>
                                </q-item-section>
                            </q-item>
                            <q-item clickable v-close-popup v-ripple @click="onEdit(EMemberAction.modify)">
                                <q-item-section>
                                    <q-item-label>
                                        修改会员
                                    </q-item-label>
                                </q-item-section>
                            </q-item>
                        </q-list>
                    </q-btn-dropdown>
                </div>
            </q-form>
        </q-expansion-item>
        <q-expansion-item :default-opened="!$q.platform.is.mobile" icon="search" label="查询功能" class="border my-1 rounded-md">
            <q-form greedy class="flex items-center p-2 py-4" @submit="onSubmit">
                <q-input v-model="query" label="搜寻" placeholder="姓名/电话"></q-input>
                <div class="flex justify-end mt-2 w-full md:w-0 md:grow">
                    <q-btn label="查询" type="submit" color="primary"></q-btn>
                </div>
            </q-form>
        </q-expansion-item>
        <q-markup-table class="h-120 md:h-115">
            <thead>
                <tr>
                    <th class="sticky top-0 z-10 bg-brown-14 text-white">姓名</th>
                    <th class="sticky top-0 z-10 bg-brown-14 text-white">电话</th>
                    <th class="sticky top-0 z-10 bg-brown-14 text-white">余额</th>
                    <th class="sticky top-0 z-10 bg-brown-14 text-white">首充打折</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="l in list" :key = l.id @click="OnSelect(l.id, l)" class="cursor-pointer relative overflow-hidden" v-ripple="isNotIOSAndSafari" :class="[!isNotIOSAndSafari ? 'transition-colors duration-150' : '', !isNotIOSAndSafari ? flashingRow === l.id ? 'bg-gray-300' : 'bg-white' : '']">
                    <td class="text-center">{{ l.name }}</td>
                    <td class="text-center">{{ l.phone }}</td>
                    <td class="text-center">{{ l.price }}</td>
                    <td class="text-center">{{ l.is_first ? '是' : '否' }}</td>
                </tr>
            </tbody>
        </q-markup-table>
    </div>
</template>