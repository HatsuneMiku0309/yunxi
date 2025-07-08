<script setup lang="ts">
import { toRefs } from 'vue';
import { useDialogPluginComponent } from 'quasar';
const { dialogRef, onDialogOK, onDialogCancel } = useDialogPluginComponent();
const props = defineProps<{}>();
const {  } = toRefs(props);

function onSubmit() {
    // call cancel api
    onDialogOK(true);
}
</script>

<template>
<q-dialog ref="dialogRef" persistent>
    <q-card class="w-3/4">
        <q-form greedy @submit.prevent="onSubmit">
            <q-card-section>
                <div class="text-h6">title</div>
            </q-card-section>
            <q-card-section>
                context
            </q-card-section>
            <q-card-actions align="center">
                <q-btn label="取消" class="!w-16" color="primary" @click="onDialogCancel" />
                <q-btn label="确认" class="!w-16" color="red" type="submit" />
            </q-card-actions>
        </q-form>
    </q-card>
</q-dialog>
</template>