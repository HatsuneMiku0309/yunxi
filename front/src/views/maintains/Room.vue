<script setup lang="ts">
import { onMounted, ref, useTemplateRef } from 'vue';
import { ERoomStatus, convertRoomEnumNameToCNString, roomStatusShowColor } from '@interfaces/room';
import type { IRoomPageData } from '@interfaces/room';
import { useQuasar } from 'quasar';
import UsingDialog from '@components/roomDialogs/UsingDialog.vue';
import { get, put } from '@/utils/api';
import { errorMsgParse } from '@/utils/utils';

const $q = useQuasar();
const form = useTemplateRef<HTMLFormElement>('form');
const roomID = ref<string>();
const roomName = ref<string>();
const room = ref<IRoomPageData>();
const actionMode = ref<ERoomStatus>();
const rooms = ref<IRoomPageData[]>([]);
onMounted(async () => {
    const roomRes = await get('/rooms');
    rooms.value = roomRes.data.data;
});

function onClean() {
    roomID.value = undefined;
    roomName.value = undefined;
    room.value = undefined;
    actionMode.value = undefined;
}

function onSelect (_room: IRoomPageData) {
    roomID.value = _room.id.toString();
    roomName.value = _room.name;
    room.value = _room;
}

async function onSubmit() {
    try {
        if (actionMode.value === undefined) {
            throw new Error('请通知管理员');
        }

        checkRoomID();
        await actionFun[actionMode.value]();
        window.location.reload()
    } catch (err: any) {
        $q.notify({
            message: errorMsgParse(err),
            color: 'red'
        });
    }
}

function checkRoomID() {
    if (!roomID.value) {
        throw new Error('请通知管理员');
    }
}

async function actionIdle() {
    await put(`/room/${roomID.value}/action/idle`, {});
}

function actionUsing() {
    return new Promise((resolve) => {
        $q.dialog({
            component: UsingDialog,
            componentProps: {
                id: roomID.value,
                room: room.value
            }
        }).onOk(() => {
            resolve(true);
        });
    });
}

async function actionReserve() {
    await put(`/room/${roomID.value}/action/reserve`, {});
}

async function actionClean() {
    await put(`/room/${roomID.value}/action/clean`, {});
}

async function actionClose() {
    await put(`/room/${roomID.value}/action/close`, {});
}

const actionFun = {
    [ERoomStatus.idle]: actionIdle,
    [ERoomStatus.using]: actionUsing,
    [ERoomStatus.reserve]: actionReserve,
    [ERoomStatus.clean]: actionClean,
    [ERoomStatus.close]: actionClose,
};

function onAction(action: ERoomStatus) {
    actionMode.value = action;
    form.value?.submit();
}
</script>

<template>
    <div>
        <q-expansion-item :default-opened="!$q.platform.is.mobile" icon="front_hand" label="操作功能" class="border my-1 rounded-md">
            <q-form ref="form" greedy class="flex items-center p-2 py-4" @submit="onSubmit">
                <q-input class="w-full md:w-64" filled label="包间" v-model="roomName" lazy-rule :rules="[val => val && val.length > 0 || '请选择卡片']" readonly />
                <div class="flex justify-end mt-2 w-full md:w-0 md:grow">
                    <q-btn color="primary" label="清除" @click="onClean"></q-btn>
                    <q-btn-dropdown class="!mx-2" color="red" label="操作">
                        <q-list>
                            <q-item clickable v-close-popup v-ripple @click="onAction(ERoomStatus.idle)">
                                <q-item-section>
                                    <q-item-label>
                                        {{ convertRoomEnumNameToCNString[ERoomStatus[ERoomStatus.idle] as keyof typeof ERoomStatus] }}
                                    </q-item-label>
                                </q-item-section>
                            </q-item>
                            <q-item clickable v-close-popup v-ripple @click="onAction(ERoomStatus.using)">
                                <q-item-section>
                                    <q-item-label>
                                        {{ convertRoomEnumNameToCNString[ERoomStatus[ERoomStatus.using] as keyof typeof ERoomStatus] }}
                                    </q-item-label>
                                </q-item-section>
                            </q-item>
                            <q-item clickable v-close-popup v-ripple @click="onAction(ERoomStatus.reserve)">
                                <q-item-section>
                                    <q-item-label>
                                        {{ convertRoomEnumNameToCNString[ERoomStatus[ERoomStatus.reserve] as keyof typeof ERoomStatus] }}
                                    </q-item-label>
                                </q-item-section>
                            </q-item>
                            <q-item clickable v-close-popup v-ripple @click="onAction(ERoomStatus.clean)">
                                <q-item-section>
                                    <q-item-label>
                                        {{ convertRoomEnumNameToCNString[ERoomStatus[ERoomStatus.clean] as keyof typeof ERoomStatus] }}
                                    </q-item-label>
                                </q-item-section>
                            </q-item>
                            <q-item clickable v-close-popup v-ripple @click="onAction(ERoomStatus.close)">
                                <q-item-section>
                                    <q-item-label>
                                        {{ convertRoomEnumNameToCNString[ERoomStatus[ERoomStatus.close] as keyof typeof ERoomStatus] }}
                                    </q-item-label>
                                </q-item-section>
                            </q-item>
                        </q-list>
                    </q-btn-dropdown>
                </div>
            </q-form>
        </q-expansion-item>
        <div class="flex">
            <q-intersection v-for="(room, index) in rooms" :key="index" class="w-1/2 sm:w-1/3 lg:w-1/4" transition="scale" once>
                <q-card flat bordered class="q-ma-xs" @click="onSelect(room)" :class="{ '!border-2 !border-blue-500': roomID === room.id.toString() }">
                    <img src="/room.jpeg">
                    <q-card-section class="q-pt-xs !p-2">
                        <q-badge :color="roomStatusShowColor[room.status]" :label="convertRoomEnumNameToCNString[ERoomStatus[room.status] as keyof typeof ERoomStatus]" />
                        <div class="text-h6">
                            <q-chip size="xs" class="bg-brown-14" text-color="white !p-2">
                                {{ room.no }}
                            </q-chip>
                            {{ room.name }}
                        </div>
                    </q-card-section>
                    <q-card-section class="q-pt-none !p-2">
                        <div class="text-caption text-grey">
                            {{ room.extends.map(e => (!e.worker && !e.service) ? '' : `${e.worker ? e.worker.name : '无'}(${e.service?.name || '无'})`).join(' / ') }}
                        </div>
                    </q-card-section>
                    <q-card-section class="q-pt-sm !p-2">
                        {{ room.desc ? `说明: ${room.desc}` : '' }}
                    </q-card-section>
                </q-card>
            </q-intersection>
        </div>
    </div>
</template>