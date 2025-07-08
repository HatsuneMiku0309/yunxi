<script setup lang="ts">
import type { IServicePageData } from '@/interfaces/service';
import { onMounted, ref } from 'vue';
import { get } from '@utils/api';

const services = ref<IServicePageData[]>([]);
onMounted(async () => {
    const serviceRes = await get('/services');
    services.value = serviceRes.data.data;
});
</script>

<template>
    <div>
        <q-markup-table>
            <thead>
                <tr>
                    <th class="sticky top-0 z-10 bg-brown-14 text-white">服务名称</th>
                    <th class="sticky top-0 z-10 bg-brown-14 text-white">服务时间(min)</th>
                    <th class="sticky top-0 z-10 bg-brown-14 text-white">价格</th>
                    <th class="sticky top-0 z-10 bg-brown-14 text-white">备注</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(service, index) in services" :key="index">
                    <td class="text-center">{{ service.name }}</td>
                    <td class="text-center">{{ service.time }}</td>
                    <td class="text-center">{{ service.price }}</td>
                     <td class="text-center">{{ service.desc }}</td>
                </tr>
            </tbody>
        </q-markup-table>
    </div>
</template>
