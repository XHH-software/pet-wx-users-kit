<template>
  <view class="package-card" @click="$emit('click')">
    <image class="package-card__image" :src="item.image || '/static/images/placeholder.png'" mode="aspectFill" />
    <view class="package-card__info">
      <text class="package-card__name p-ellipsis">{{ item.name }}</text>
      <text class="package-card__desc p-ellipsis">{{ item.description || '精选服务组合' }}</text>
      <view class="package-card__details" v-if="item.details && item.details.length">
        <text class="package-card__detail-item" v-for="d in item.details.slice(0, 3)" :key="d.serviceItemId">
          {{ d.serviceName }} ×{{ d.quantity }}
        </text>
        <text v-if="item.details.length > 3" class="package-card__detail-more">+{{ item.details.length - 3 }}</text>
      </view>
      <view class="package-card__bottom">
        <view class="package-card__prices">
          <text class="package-card__selling">¥{{ item.sellingPrice }}</text>
          <text class="package-card__original">¥{{ item.originalPrice }}</text>
        </view>
        <view class="package-card__tag" v-if="discount">
          <text>{{ discount }}折</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  item: { type: Object, required: true }
})

defineEmits(['click'])

const discount = computed(() => {
  if (!props.item.originalPrice || !props.item.sellingPrice) return null
  const d = (props.item.sellingPrice / props.item.originalPrice * 10).toFixed(1)
  return d < 10 ? d : null
})
</script>

<style scoped lang="scss">
.package-card {
  background: $p-bg-card;
  border-radius: $p-radius-lg;
  overflow: hidden;
  box-shadow: $p-shadow-card;
  margin-bottom: 20rpx;

  &__image {
    width: 100%;
    height: 280rpx;
    background: $p-bg-page;
  }

  &__info {
    padding: 24rpx;
  }

  &__name {
    font-size: 32rpx;
    font-weight: 600;
    color: $p-text-1;
    display: block;
  }

  &__desc {
    font-size: 24rpx;
    color: $p-text-3;
    margin-top: 8rpx;
    display: block;
  }

  &__details {
    display: flex;
    flex-wrap: wrap;
    gap: 8rpx;
    margin-top: 16rpx;
  }

  &__detail-item {
    font-size: 22rpx;
    color: $p-text-2;
    background: $p-bg-page;
    padding: 4rpx 12rpx;
    border-radius: $p-radius-sm;
  }

  &__detail-more {
    font-size: 22rpx;
    color: $p-text-3;
    padding: 4rpx 8rpx;
  }

  &__bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 20rpx;
  }

  &__prices {
    display: flex;
    align-items: baseline;
    gap: 12rpx;
  }

  &__selling {
    font-size: 40rpx;
    font-weight: 700;
    color: $p-danger;
  }

  &__original {
    font-size: 24rpx;
    color: $p-text-4;
    text-decoration: line-through;
  }

  &__tag {
    background: $p-danger;
    color: #fff;
    font-size: 22rpx;
    padding: 4rpx 12rpx;
    border-radius: $p-radius-sm;
  }
}
</style>
