<template>
  <view class="page">
    <!-- Top Image -->
    <view class="hero-image">
      <image
        class="hero-image__img"
        :src="detail.image || '/static/images/placeholder.png'"
        mode="aspectFill"
      />
    </view>

    <!-- Basic Info -->
    <view class="info-card">
      <view class="info-card__header">
        <text class="info-card__name">{{ detail.name }}</text>
        <view class="info-card__price-row">
          <text class="info-card__currency">¥</text>
          <text class="info-card__price">{{ detail.price }}</text>
          <text class="info-card__unit">/次</text>
        </view>
      </view>

      <!-- Tags -->
      <view class="info-card__tags">
        <view class="tag" v-if="detail.duration">
          <text class="tag__text">{{ detail.duration }}分钟</text>
        </view>
        <view class="tag" v-if="detail.petSizeLimit !== undefined && detail.petSizeLimit !== null">
          <text class="tag__text">{{ sizeLabel }}</text>
        </view>
        <view class="tag" v-if="detail.categoryName">
          <text class="tag__text">{{ detail.categoryName }}</text>
        </view>
      </view>
    </view>

    <!-- Description -->
    <view class="desc-card" v-if="detail.description">
      <view class="desc-card__header">
        <text class="desc-card__title">服务介绍</text>
      </view>
      <view class="desc-card__body">
        <text class="desc-card__text">{{ detail.description }}</text>
      </view>
    </view>

    <!-- Package Details (if isPackage) -->
    <view class="desc-card" v-if="isPackage && packageDetails.length">
      <view class="desc-card__header">
        <text class="desc-card__title">套餐内容</text>
      </view>
      <view class="desc-card__body">
        <view class="package-detail-item" v-for="(item, index) in packageDetails" :key="index">
          <text class="package-detail-item__name">{{ item.serviceName }}</text>
          <view class="package-detail-item__right">
            <text class="package-detail-item__qty">×{{ item.quantity }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Spacer for bottom button -->
    <view class="bottom-spacer"></view>

    <!-- Bottom Action Bar -->
    <view class="action-bar p-safe-bottom">
      <view class="action-bar__inner">
        <view class="action-bar__btn" @click="goToAppointment">
          <text class="action-bar__btn-text">立即预约</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getServiceItemDetail } from '@/api/serviceItem'
import { getPackageDetail } from '@/api/servicePackage'
import { getLabelByValue } from '@/constants/dict'

const detail = ref({})
const isPackage = ref(false)
const packageDetails = ref([])
const serviceItemId = ref(null)

const sizeLabel = computed(() => {
  if (detail.value.petSizeLimit === undefined || detail.value.petSizeLimit === null) return ''
  return getLabelByValue('sizeLimit', detail.value.petSizeLimit)
})

async function loadDetail() {
  if (!serviceItemId.value) {
    uni.showToast({ icon: 'none', title: '参数错误' })
    return
  }

  uni.showLoading({ title: '加载中...' })
  try {
    if (isPackage.value) {
      const data = await getPackageDetail(serviceItemId.value)
      detail.value = data || {}
      packageDetails.value = data?.details || []
    } else {
      const data = await getServiceItemDetail(serviceItemId.value)
      detail.value = data || {}
    }
  } catch (e) {
    console.error('loadDetail error:', e)
    uni.showToast({ icon: 'none', title: '加载失败' })
  } finally {
    uni.hideLoading()
  }
}

function goToAppointment() {
  if (isPackage.value) {
    uni.navigateTo({ url: `/pages/appointment/create?packageId=${serviceItemId.value}` })
  } else {
    uni.navigateTo({ url: `/pages/appointment/create?serviceItemId=${serviceItemId.value}` })
  }
}

onLoad((options) => {
  serviceItemId.value = options?.id ? Number(options.id) : null
  isPackage.value = options?.isPackage === '1'

  if (isPackage.value) {
    uni.setNavigationBarTitle({ title: '套餐详情' })
  } else {
    uni.setNavigationBarTitle({ title: '服务详情' })
  }

  loadDetail()
})
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: $p-bg-page;
  display: flex;
  flex-direction: column;
}

/* Hero Image */
.hero-image {
  width: 100%;
  height: 400rpx;
  flex-shrink: 0;
  background: $p-bg-page;

  &__img {
    width: 100%;
    height: 100%;
  }
}

/* Info Card */
.info-card {
  background: $p-bg-card;
  margin: -40rpx 24rpx 0;
  border-radius: $p-radius-lg;
  padding: 32rpx;
  box-shadow: $p-shadow-card;
  position: relative;
  z-index: 1;

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
  }

  &__name {
    font-size: 36rpx;
    font-weight: 700;
    color: $p-text-1;
    flex: 1;
    margin-right: 20rpx;
    line-height: 1.4;
  }

  &__price-row {
    display: flex;
    align-items: baseline;
    flex-shrink: 0;
  }

  &__currency {
    font-size: 28rpx;
    font-weight: 700;
    color: $p-danger;
  }

  &__price {
    font-size: 44rpx;
    font-weight: 700;
    color: $p-danger;
    line-height: 1;
  }

  &__unit {
    font-size: 24rpx;
    color: $p-text-3;
    margin-left: 4rpx;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
    margin-top: 24rpx;
  }
}

/* Tag */
.tag {
  display: inline-flex;
  align-items: center;
  padding: 8rpx 20rpx;
  background: $p-bg-page;
  border-radius: $p-radius-sm;

  &__text {
    font-size: 24rpx;
    color: $p-text-2;
  }
}

/* Description Card */
.desc-card {
  background: $p-bg-card;
  margin: 24rpx 24rpx 0;
  border-radius: $p-radius-lg;
  padding: 32rpx;
  box-shadow: $p-shadow-card;

  &__header {
    margin-bottom: 20rpx;
  }

  &__title {
    font-size: 30rpx;
    font-weight: 600;
    color: $p-text-1;
    position: relative;
    padding-left: 20rpx;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 6rpx;
      height: 28rpx;
      background: $p-primary;
      border-radius: 3rpx;
    }
  }

  &__body {
    padding-left: 20rpx;
  }

  &__text {
    font-size: 28rpx;
    color: $p-text-2;
    line-height: 1.8;
    white-space: pre-wrap;
  }
}

/* Package Detail Items */
.package-detail-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;
  border-bottom: 1rpx solid $p-border-light;

  &:last-child {
    border-bottom: none;
  }

  &__name {
    font-size: 28rpx;
    color: $p-text-1;
    flex: 1;
  }

  &__right {
    flex-shrink: 0;
    margin-left: 16rpx;
  }

  &__qty {
    font-size: 28rpx;
    color: $p-text-2;
    font-weight: 500;
  }
}

/* Bottom Spacer */
.bottom-spacer {
  height: 160rpx;
  flex-shrink: 0;
}

/* Action Bar */
.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: $p-bg-card;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.06);
  z-index: 100;

  &__inner {
    padding: 16rpx 32rpx;
    display: flex;
    align-items: center;
  }

  &__btn {
    flex: 1;
    height: 88rpx;
    background: $p-primary;
    border-radius: $p-radius-round;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.2s ease;

    &:active {
      opacity: 0.85;
    }
  }

  &__btn-text {
    font-size: 32rpx;
    font-weight: 600;
    color: #ffffff;
  }
}
</style>
