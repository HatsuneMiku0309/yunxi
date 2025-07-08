<script setup lang="ts">
import { ref } from 'vue';
import Room from './maintains/Room.vue';
import WorkerPage from './maintains/Worker.vue';
import ReceivingPayment from './ReceivingPayment.vue';

const splitterModel = ref<number>(50);
</script>
<template>
    <div class="q-pa-sm">
        <q-expansion-item :default-opened="$q.platform.is.mobile" label="付款" class="my-1 rounded-md q-pa-md border-0">
            <ReceivingPayment></ReceivingPayment>
        </q-expansion-item>
        <q-separator inset />
        <q-expansion-item :default-opened="!$q.platform.is.mobile" label="包间/技师" class="my-1 rounded-md q-pa-md border-0">
            <q-splitter v-model="splitterModel">
                <template v-slot:before>
                    <Room class="q-pa-sm"></Room>
                </template>
                <template v-slot:after>
                    <WorkerPage class="q-pa-sm"></WorkerPage>
                </template>
            </q-splitter>
        </q-expansion-item>
    </div>
</template>