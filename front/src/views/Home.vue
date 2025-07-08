<script setup lang="ts">
import { onMounted, ref } from 'vue';

const slide = ref('aa');

onMounted(() => {
  // document.addEventListener('fullscreenchange', (e) => {
  //   e.preventDefault();
  //   // const fsElement = document.fullscreenElement;
  //   // console.log(fsElement);
  //   // if (!fsElement) { e.preventDefault(); }
  // })
})
</script>

<template>
  <div>
    <q-carousel
      animated
      v-model="slide"
      infinite
      arrows
    >
      <q-carousel-slide name="aa" class="flex justify-center bg-black !p-0">
        <video class="q-video h-full border-2" src="/培训日.mp4" controls playsinline autoplay loop></video>
      </q-carousel-slide>
      <q-carousel-slide name="bb" class="flex justify-center bg-black !p-0">
        <video class="q-video h-full border-2" src="/培训日.mp4" controls playsinline autoplay loop></video>
      </q-carousel-slide>
    </q-carousel>
    
    <div class="q-px-md mt-4">
      <q-timeline>
        <q-timeline-entry heading>开业前</q-timeline-entry>
        <q-timeline-entry title="装修期" subtitle="2025/04/10">
          <div>
            已经亏了一个月的房租了，要吃土了QAQ
          </div>
        </q-timeline-entry>
        <q-timeline-entry heading>云栖足道开业</q-timeline-entry>
        <q-timeline-entry title="本店开业" subtitle="2025/05/15">
          <div>
            本店在中山路194号开始开业，老爷爷来按脚，100元不找零～。
          </div>
        </q-timeline-entry>
        <q-timeline-entry title="专业技师" subtitle="2025/06/01">
          <div>
            本店来了二位专业技师，手法非常nice！客户满意度100%
          </div>
        </q-timeline-entry>
        <q-timeline-entry title="美团星级" subtitle="2025/06/17">
          <div>
            美团四星（<q-icon v-for="_i in 4" name="star"></q-icon>）突破，并且升级为银牌<q-icon name="loyalty"></q-icon>，客户对本店服务满意度100%
          </div>
        </q-timeline-entry>
        <q-timeline-entry title="业绩突破" subtitle="2025/06/31">
          <div>
            月业绩终于突破100万元，老板天天出门包八个男模Happy
          </div>
        </q-timeline-entry>
        <q-timeline-entry title="美团星级" subtitle="2025/07/01">
          <div>
            美团升级为金牌<q-icon name="loyalty"></q-icon>，客户对本店服务满意度100%
          </div>
        </q-timeline-entry>
      </q-timeline>
    </div>
  </div>
</template>

<style scoped>

</style>
