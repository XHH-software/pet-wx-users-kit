<template>
  <view class="service-card" @click="$emit('click')">
    <image class="service-card__image" :src="item.image || '/static/images/placeholder.png'" mode="aspectFill" />
    <view class="service-card__info">
      <text class="service-card__name p-ellipsis">{{ item.name }}</text>
      <view class="service-card__meta">
        <text class="service-card__duration">{{ item.duration }}分钟</text>
        <text v-if="item.petSizeLimit" class="service-card__size">{{ sizeLabel }}</text>
      </view>
      <view class="service-card__bottom">
        <text class="service-card__price">¥{{ item.price }}</text>
        <text v-if="item.categoryName" class="service-card__category">{{ item.categoryName }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { getLabelByValue } from '@/constants/dict'

const props = defineProps({
  item: { type: Object, required: true }
})

defineEmits(['click'])

const sizeLabel = computed(() => getLabelByValue('sizeLimit', props.item.petSizeLimit))
</script>

<style scoped lang="scss">
.service-card {
  display: flex;
  background: $p-bg-card;
  border-radius: $p-radius-lg;
  padding: 24rpx;
  box-shadow: $p-shadow-card;
  margin-bottom: 20rpx;

  &__image {
    width: 160rpx;
    height: 160rpx;
    border-radius: $p-radius;
    flex-shrink: 0;
    background: $p-bg-page;
  }

  &__info {
    flex: 1;
    margin-left: 24rpx;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 160rpx;
  }

  &__name {
    font-size: 30rpx;
    font-weight: 600;
    color: $p-text-1;
    line-height: 1.4;
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 16rpx;
    margin-top: 8rpx;
  }

  &__duration,
  &__size {
    font-size: 24rpx;
    color: $p-text-3;
    background: $p-bg-page;
    padding: 2rpx 12rpx;
    border-radius: $p-radius-sm;
  }

  &__bottom {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
  }

  &__price {
    font-size: 36rpx;
    font-weight: 700;
    color: $p-danger;
  }

  &__category {
    font-size: 22rpx;
    color: $p-text-3;
  }
}
</style>
