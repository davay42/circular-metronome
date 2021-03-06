<script setup>
import { ref, computed, watch } from 'vue'
import { getCircleCoord, rotateArray } from '@/use/calculations'
import { useSequence } from '@/use/sequence.js'
import { levelColor } from "@/use/colors.js"
import { tempo } from '@/use/tempo'

const emit = defineEmits(['del', 'over', 'under', 'sound'])

const props = defineProps({
  radius: { type: Number, default: 400 },
  size: { type: Number, default: 175, },
  order: { type: Number, default: 0 },
  loop: { type: Object, default: { over: 4, under: 4, sound: 'A' } }
});

const soundLetters = ['A', 'B', 'C', 'D', 'E', 'F']
const soundControl = ref(soundLetters.findIndex(el => el == props.loop?.sound))
const controlRadius = computed(() => props.radius + 110)

const { progress, current, steps, mutes, accents, volume, panning, addSample, recorder } = useSequence(props.loop, props.order, 'circle')

watch(soundControl, num => {
  emit('sound', soundLetters[num])
})

const activeSteps = computed(() => {
  return steps.filter(step => !mutes.value[step[0].split('-')[0]]).map(step => Number(step[0].split('-')[0]))
})

const lineProgress = computed(() => {
  if (progress.value > 0) {
    return getCircleCoord(progress.value * 360, 360, props.radius + 50, 1000)
  } else {
    return { x: 500, y: 100 }
  }
});

function dragVol(drag) {
  volume.value -= -drag.delta[1]
}

function dragPan(drag) {
  panning.value += drag.delta[0] / 100
}

function rotateAccents(num) {
  accents.value = rotateArray(accents.value, num)
  mutes.value = rotateArray(mutes.value, num)
}

</script>


<template lang="pug">
g(
  text-anchor="middle",
  style="user-select:none;transition:all 300ms ease"
)
  g(opacity="0.5")
    circle(
      cx="500"
      cy="500"
      :r="radius - 55"

      stroke-width="2"
      fill="transparent"
      stroke="currentColor"
    )
  g.steps(
    :opacity="volume"
  )
    g(
      v-for="(step, s) in activeSteps"
      :key="step"
      )
      line(
        :x1="getCircleCoord(step, steps.length, radius - 55, 1000).x"
        :y1="getCircleCoord(step, steps.length, radius - 55, 1000).y"
        :x2="getCircleCoord(activeSteps[s + 1] || activeSteps[0], steps.length, radius - 55, 1000).x"
        :y2="getCircleCoord(activeSteps[s + 1] || activeSteps[0], steps.length, radius - 55, 1000).y"
        stroke-width="8"
        :stroke="levelColor((step + (tempo.pitch / 12) * steps.length), steps.length, 1)"
      )
    circle-sector(
      v-for="(step, s) in steps"
      :key="step"
      :step="s"
      :total="steps.length"
      :active="!mutes[s] && step == current"
      :radius="radius - 5"
      :muted="mutes[s]"
      style="cursor:pointer"
      @accent="accents[s] = !accents[s]"
      @mute="mutes[s] = !mutes[s]"
      :accented="Boolean(accents[s])"
    )
  control-sector.under(
    :radius="controlRadius"
    :start="16 + order * 11"
    :finish="90"
    v-model="loop.under"
    :step="1"
    font-size="30"
    :min="1"
    :max="16"
    :vector="[-1, -1]"
    show-positions
    :ratio="800"
    :every="4"
  )
    text {{ loop.under }}

  control-sector.over(
    :radius="controlRadius"
    :start="343 - order * 11"
    :finish="270"
    v-model="loop.over"
    :step="1"
    font-size="30"
    :min="2"
    :max="48 - order * 24"
    :vector="[1, -1]"
    show-positions
    :ratio="1000"
    :every="4"
  )
    text {{ loop.over }}

  control-sector.vol(
    :radius="controlRadius"
    :start="98 + order * 6"
    :finish="130"
    v-model="volume"
    font-size="30"
    :fixed="1"
    :step="0.02"
    :min="0"
    :max="1"
    :vector="[1, -1]"
  )
    la-volume-up(x="-18" y="-28")

  control-sector.pan(
    :radius="controlRadius"
    :start="138 + order * 6"
    :finish="175"
    v-model="panning"
    font-size="30"
    :fixed="1"
    :step="0.05"
    :min="-1"
    :max="1"
    show-center
  )
    mdi-pan-horizontal(x="-18" y="-28")

  control-sector.sound(
    :radius="controlRadius"
    v-model="soundControl"
    :vector="[1, 1]"
    :start="183 + order * 6"
    :finish="262 - order * 6"
    font-size="30"
    :fixed="1"
    :step="1"
    :min="0"
    :max="5"
    show-positions
    :ratio="400"
    :every="1"
  )
    text {{ loop?.sound }}

  transition(name="fade")
    recorder(
      :transform="`translate(200 ${800 - order * 220})`" 
      v-if="soundControl == 5 && !recorder.both"
      :recorder="recorder"
      @close="soundControl--"
    )

  g.info(
    :transform="`translate(500,${order * size + 50})`"
    v-drag="rotateAccents"
  )
    text(
      fill="currentColor"
      font-size="45"
    ) /
    text(
      fill="currentColor"
      font-family="Commissioner, sans-serif"
      font-size="40px"
      text-anchor="end",
      :x="-10",
      :y="-3",
      ) {{ loop.over }} 
    text(
      fill="currentColor"
      font-family="Commissioner, sans-serif"
      font-size="40px"
      text-anchor="start",
      :x="10",
      :y="-3",
      ) {{ loop.under }} 
    g.cursor-pointer.opacity-50.transition-all.duration-200.ease.hover_opacity-100(
      transform="translate(74,-10)"
      @mousedown="rotateAccents(-1)"
    )
      circle(
        r="18"
        fill="#5553"
      )
      la-angle-right(
        font-size="28"
        x="-17"
        y="-17"
      )
    g.cursor-pointer.opacity-50.transition-all.duration-200.ease.hover_opacity-100(
      transform="translate(-78,-10)"
      @mousedown="rotateAccents(1)"
    )
      circle(
        r="18"
        fill="#5553"
      )
      la-angle-left(
        font-size="28"
        x="-17"
        y="-17"
      )
  g.arrows.pointer-events-none(
  )
    line(
      :x1="500"
      :y1="500"
      stroke-width="4"
      stroke="currentColor"
      stroke-linecap="cound"
      :x2="lineProgress.x"
      :y2="lineProgress.y"
    )
    circle(
      :cx="500"
      :cy="500"
      fill="currentColor"
      :r="5"
    )
</template>
  
<style lang="postcss" scoped>
.info {
  @apply p-2 rounded-full m-1 border-1 border-current text-2xl;
}

.active {
  stroke: currentColor;
  font-weight: bold;
}

.active,
.measure.active {
  @apply bg-current transition-all duration-200;
}

.measure {
  background-color: hsla(0, 0%, 50%, 0.5);
}
</style>