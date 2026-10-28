<template>
  <view class="price-display">
    <text class="price-display__symbol">¥</text>
    <text class="price-display__integer">{{ integer }}</text>
    <text class="price-display__decimal">.{{ decimal }}</text>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: { type: [Number, String], required: true },
  size: { type: String, default: 'normal' }
})

const integer = computed(() => {
  const n = Number(props.value).toFixed(2)
  return n.split('.')[0]
})

const decimal = computed(() => {
  const n = Number(props.value).toFixed(2)
  return n.split('.')[1]
})
</script>

<style scoped lang="scss">
.price-display {
  display: inline-flex;
  align-items: baseline;
  color: $p-danger;

  &__symbol {
    font-size: 24rpx;
    font-weight: 600;
  }

  &__integer {
    font-size: 36rpx;
    font-weight: 700;
    font-family: 'DIN Alternate', 'Helvetica Neue', sans-serif;
  }

  &__decimal {
    font-size: 24rpx;
    font-weight: 600;
  }
}
</style>
