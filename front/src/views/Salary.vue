<script setup lang="ts">
import { ref } from 'vue';
import dayjs from 'dayjs';
import DateTimePickerInput from '@/components/DateTimePickerInput.vue';
import { useQuasar } from 'quasar';
import { get } from '@/utils/api';
import type { ISalaryRow } from '@/interfaces/salary';
import _ from 'lodash';
import Decimal from 'decimal.js';

const $q = useQuasar();
const nowDate = new Date();
const showGroup = ref(false);
const startDate = ref(dayjs(nowDate).subtract(11, 'hour').format('YYYY/MM/DD 12:00'));
const endDate = ref(dayjs(nowDate).subtract(11, 'hour').add(1, 'day').format('YYYY-MM-DD 11:59'));
// const container = useTemplateRef('container');
const shape = ref<string>('worker_id');
const list = ref<ISalaryRow[]>([]);
let listTemp: ISalaryRow[] = [];
const ttlIndex = -999999;

async function onSubmit() {
    const salaryRes = await get('/salarys', {
        params: {
            start_date: startDate.value,
            end_date: endDate.value
        }
    });
    list.value = salaryRes.data.data;
    listTemp = _.clone(salaryRes.data.data);
    ttl();
}

function actionGrouop(v: boolean) {
    if (v) {
        groupData();
    } else {
        list.value = _.clone(listTemp);
        ttl();
    }
}

function groupData() {
    const datas = _.groupBy(listTemp, shape.value);
    let groupIndex = -1;
    let result = <ISalaryRow[]> _.map(datas, (vs, k) => {
        let ttl: ISalaryRow = {
            id: groupIndex--,
            date_time: '',
            pay_time: '',
            worker_id: '0',
            worker_name: '',
            service_id: '0',
            service_name: '',
            price: 0,
            extend_price: 0,
            total_price: 0,
            assignPrice: 0,
            increasePrice: 0,
            bonus_price: 0,
            salary: 0,
            total_salary: 0
        };
        if (shape.value === 'worker_id') {
            ttl.worker_id = k;
            ttl.worker_name = vs[0].worker_name;
        } else if (shape.value === 'service_id') {
            ttl.service_id = k;
            ttl.service_name = vs[0].service_name;
        } else if (shape.value === 'date_time') {
            ttl.date_time = k;
        }
        _.forEach(vs, (v) => {
            ttl.price = new Decimal(ttl.price).plus(v.price).toNumber();
            ttl.extend_price = new Decimal(ttl.extend_price).plus(v.extend_price).toNumber();
            ttl.total_price = new Decimal(ttl.total_price).plus(v.total_price).toNumber();
            ttl.assignPrice = new Decimal(ttl.assignPrice).plus(v.assignPrice).toNumber();
            ttl.increasePrice = new Decimal(ttl.increasePrice).plus(v.increasePrice).toNumber();
            ttl.bonus_price = new Decimal(ttl.bonus_price).plus(v.bonus_price).toNumber();
            ttl.salary = new Decimal(ttl.salary).plus(v.salary).toNumber();
            ttl.total_salary = new Decimal(ttl.total_salary).plus(v.total_salary).toNumber();
        });
        return [...vs, ttl];
    }).flat(Infinity);
    list.value = result;
}

function ttl() {
    let ttl: ISalaryRow = {
        id: ttlIndex,
        date_time: 'TTL',
        pay_time: '',
        worker_id: '0',
        worker_name: '',
        service_id: '0',
        service_name: '',
        price: 0,
        extend_price: 0,
        total_price: 0,
        assignPrice: 0,
        increasePrice: 0,
        bonus_price: 0,
        salary: 0,
        total_salary: 0
    };
    _.forEach(listTemp, (v) => {
        ttl.price = new Decimal(ttl.price).plus(v.price).toNumber();
        ttl.extend_price = new Decimal(ttl.extend_price).plus(v.extend_price).toNumber();
        ttl.total_price = new Decimal(ttl.total_price).plus(v.total_price).toNumber();
        ttl.assignPrice = new Decimal(ttl.assignPrice).plus(v.assignPrice).toNumber();
        ttl.increasePrice = new Decimal(ttl.increasePrice).plus(v.increasePrice).toNumber();
        ttl.bonus_price = new Decimal(ttl.bonus_price).plus(v.bonus_price).toNumber();
        ttl.salary = new Decimal(ttl.salary).plus(v.salary).toNumber();
        ttl.total_salary = new Decimal(ttl.total_salary).plus(v.total_salary).toNumber();
    });
    list.value.push(ttl);
}

function changeGroupKey() {
    if (showGroup.value) {
        list.value = _.clone(listTemp);
        groupData();
    }
}

</script>

<template>
    <div>
    <!-- <div ref="container"> -->
        <q-expansion-item :default-opened="!$q.platform.is.mobile" icon="front_hand" label="操作功能" class="border my-1 rounded-md">
            <q-radio v-model="shape" val="worker_id" label="技师" @update:model-value="changeGroupKey"></q-radio>
            <q-radio v-model="shape" val="service_id" label="服务" @update:model-value="changeGroupKey"></q-radio>
            <q-radio v-model="shape" val="date_time" label="日期" @update:model-value="changeGroupKey"></q-radio>
            <div class="flex justify-end px-4">
                <q-toggle v-model="showGroup" label="显示汇总" @update:model-value="actionGrouop"/>
            </div>
        </q-expansion-item>
        <q-expansion-item :default-opened="!$q.platform.is.mobile" icon="search" label="查询功能" class="border my-1 rounded-md">
            <q-form greedy class="flex items-center p-2 py-4" @submit="onSubmit">
                <DateTimePickerInput class="w-full md:w-64" v-model="startDate" label="开始时间" display-format="YYYY/MM/DD HH:mm"/>
                <!-- <q-input filled label="开始日期" type="datetime-local" v-model="startDate" class="w-full md:w-64" @keydown.prevent inputmode="none"/> -->
                <span class="mx-auto md:ml-2 md:mx-0">~</span>
                <DateTimePickerInput class="w-full md:w-64 md:ml-2" v-model="endDate" label="结束日期" display-format="YYYY/MM/DD HH:mm"/>
                <!-- <q-input filled label="结束日期" type="datetime-local" v-model="endDate" class="w-full md:w-64 md:ml-2" @keydown.prevent inputmode="none"/> -->
                <div class="flex justify-end mt-2 w-full md:w-0 md:grow">
                    <q-btn label="查询" type="submit" color="primary"></q-btn>
                </div>
            </q-form>
        </q-expansion-item>
        <q-markup-table class="h-120 md:h-115">
            <thead>
                <tr>
                    <th class="sticky top-0 z-10 bg-brown-14 text-white">日期</th>
                    <th class="sticky top-0 z-10 bg-brown-14 text-white">技师</th>
                    <th class="sticky top-0 z-10 bg-brown-14 text-white">服务项目</th>
                    <th class="sticky top-0 z-10 bg-brown-14 text-white">服务价格</th>
                    <th class="sticky top-0 z-10 bg-brown-14 text-white">额外金额</th>
                    <th class="sticky top-0 z-10 bg-brown-14 text-white">总金额</th>
                    <th class="sticky top-0 z-10 bg-brown-14 text-white">加钟</th>
                    <th class="sticky top-0 z-10 bg-brown-14 text-white">点钟</th>
                    <th class="sticky top-0 z-10 bg-brown-14 text-white">额外奖金</th>
                    <th class="sticky top-0 z-10 bg-brown-14 text-white">工资</th>
                    <th class="sticky top-0 z-10 bg-brown-14 text-white">工资（点/加/奖）</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="l in list" :key = l.id :class="[l.id < 0 ? 'bg-brown-14 text-white' : '']">
                    <td class="text-center">{{ l.date_time }}</td>
                    <td class="text-center">{{ l.worker_name }}</td>
                    <td class="text-center">{{ l.service_name }}</td>
                    <td class="text-center">{{ l.price }}</td>
                    <td class="text-center">{{ l.extend_price }}</td>
                    <td class="text-center">{{ l.total_price }}</td>
                    <td class="text-center">{{ l.increasePrice || '-' }}</td>
                    <td class="text-center">{{ l.assignPrice || '-' }}</td>
                    <td class="text-center">{{ l.bonus_price }}</td>
                    <td class="text-center">{{ l.salary }}</td>
                    <td class="text-center">{{ l.total_salary }}</td>
                </tr>
            </tbody>
        </q-markup-table>
    </div>
</template>