<template>
  <view class="status-tag" :style="{ color: tagColor, background: tagBg }">
    {{ label }}
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { getLabelByValue, getColorByValue } from '@/constants/dict'

const props = defineProps({
  value: { type: [Number, String], required: true },
  dict: { type: String, required: true }
})

const label = computed(() => getLabelByValue(props.dict, props.value))
const tagColor = computed(() => getColorByValue(props.dict, props.value))
const tagBg = computed(() => {
  const c = tagColor.value
  return c + '15'
})
</script>

<style scoped lang="scss">
.status-tag {
  display: inline-flex;
  align-items: center;
  padding: 4rpx 16rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  font-weight: 500;
  line-height: 1.6;
}
</style>
