<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import dayjs from 'dayjs'

const props = defineProps<{
  modelValue: string
  label?: string
  displayFormat?: string
}>()

const emit = defineEmits(['update:modelValue'])

const date = ref('')
const time = ref('')
const tmpDate = ref('')
const tmpTime = ref('')
const popup = ref(false)

// 當外部modelValue變化時，同步到暫存tmpDate/tmpTime
watch(() => props.modelValue, (val) => {
  if (val) {
    const d = dayjs(val)
    date.value = d.format('YYYY/MM/DD')
    time.value = d.format('HH:mm')
    tmpDate.value = date.value
    tmpTime.value = time.value
  } else {
    date.value = ''
    time.value = ''
    tmpDate.value = ''
    tmpTime.value = ''
  }
}, { immediate: true })

const displayValue = computed(() => {
  if (!date.value || !time.value) return ''
  return dayjs(`${date.value}T${time.value}`).format(props.displayFormat || 'YYYY-MM-DD HH:mm')
})

// 點確認時才更新外部modelValue和內部日期時間
function onConfirm() {
  if (tmpDate.value && tmpTime.value) {
    date.value = tmpDate.value
    time.value = tmpTime.value
    emit('update:modelValue', `${date.value}T${time.value}`)
    popup.value = false
  }
}

// 點取消或關閉彈窗，放棄修改，還原暫存值
function onCancel() {
  tmpDate.value = date.value
  tmpTime.value = time.value
  popup.value = false
}

</script>

<template>
  <q-input
  filled
  :label="label"
  :model-value="displayValue"
  readonly
  @click="popup = true"
>
  <template #append>
    <q-icon
      name="event"
      class="cursor-pointer"
      @click="popup = true"
    />
  </template>

  <q-dialog v-model="popup" persistent>
    <q-card class="!max-h-[calc(100vh-200px)] q-pa-md flex justify-center !rounded-2xl bg-transparent !overflow-y-auto [scrollbar-width:none]">
      <div class="flex w-full justify-center">
        <q-date v-model="tmpDate" :landscape="false" />
      </div>
      <div class="flex mt-4 w-full justify-center">
        <q-time v-model="tmpTime" format24h :landscape="false" class="q-mt-sm" />
      </div>
      <div class="w-full row justify-center q-gutter-sm q-mt-sm">
        <q-btn label="取消" color="primary" @click="onCancel" />
        <q-btn label="確認" color="primary" @click="onConfirm" />
      </div>
    </q-card>
  </q-dialog>
</q-input>
</template>