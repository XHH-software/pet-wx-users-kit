<template>
  <view class="empty-state">
    <image v-if="image" class="empty-state__image" :src="image" mode="aspectFit" />
    <view v-else class="empty-state__icon">
      <text class="empty-state__icon-text">∅</text>
    </view>
    <text class="empty-state__text">{{ description }}</text>
    <slot />
  </view>
</template>

<script setup>
defineProps({
  description: { type: String, default: '暂无数据' },
  image: { type: String, default: '' }
})
</script>

<style scoped lang="scss">
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 40rpx;

  &__image {
    width: 240rpx;
    height: 240rpx;
    margin-bottom: 24rpx;
  }

  &__icon {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    background: $p-bg-page;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24rpx;
  }

  &__icon-text {
    font-size: 60rpx;
    color: $p-text-4;
  }

  &__text {
    font-size: 28rpx;
    color: $p-text-3;
  }
}
</style>
