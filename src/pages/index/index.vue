<template>
  <view class="page">
    <!-- Shop Banner -->
    <view class="shop-banner">
      <view class="shop-banner__content">
        <image
          class="shop-banner__logo"
          :src="shopInfo.logo || '/static/images/placeholder.png'"
          mode="aspectFill"
        />
        <view class="shop-banner__info">
          <text class="shop-banner__name p-ellipsis">{{ shopInfo.name || '宠物服务' }}</text>
          <view class="shop-banner__status" :class="statusClass">
            <text class="shop-banner__status-text">{{ statusText }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Shop Contact -->
    <view class="shop-contact">
      <view class="shop-contact__item" @click="copyAddress" v-if="shopInfo.address">
        <text class="shop-contact__icon">&#xe610;</text>
        <text class="shop-contact__text p-ellipsis">{{ shopInfo.address }}</text>
      </view>
      <view class="shop-contact__item" @click="callPhone" v-if="shopInfo.phone">
        <text class="shop-contact__icon">&#xe612;</text>
        <text class="shop-contact__text">{{ shopInfo.phone }}</text>
      </view>
    </view>

    <!-- Category Scroll -->
    <view class="section" v-if="categories.length">
      <scroll-view scroll-x class="category-scroll" :show-scrollbar="false">
        <view class="category-scroll__inner">
          <view
            class="category-item"
            v-for="cat in categories"
            :key="cat.id"
            @click="goToServiceList(cat.id)"
          >
            <view class="category-item__icon">
              <text class="category-item__icon-text">{{ cat.name.charAt(0) }}</text>
            </view>
            <text class="category-item__name p-ellipsis">{{ cat.name }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- Hot Services -->
    <view class="section" v-if="hotServices.length">
      <view class="section__header">
        <text class="section__title">热门服务</text>
        <view class="section__more" @click="goToServiceList()">
          <text class="section__more-text">查看全部</text>
          <text class="section__more-arrow">></text>
        </view>
      </view>
      <view class="hot-services">
        <ServiceCard
          v-for="item in hotServices"
          :key="item.id"
          :item="item"
          @click="goToServiceDetail(item.id)"
        />
      </view>
    </view>

    <!-- Packages -->
    <view class="section" v-if="packages.length">
      <view class="section__header">
        <text class="section__title">超值套餐</text>
      </view>
      <scroll-view scroll-x class="package-scroll" :show-scrollbar="false">
        <view class="package-scroll__inner">
          <PackageCard
            v-for="item in packages"
            :key="item.id"
            :item="item"
            @click="goToPackageDetail(item.id)"
          />
        </view>
      </scroll-view>
    </view>

    <!-- Empty State -->
    <EmptyState
      v-if="!loading && !hotServices.length && !packages.length"
      description="暂无服务数据"
    />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
import { getShopStatus } from '@/api/user'
import { getCategoryList } from '@/api/category'
import { getServiceItemList } from '@/api/serviceItem'
import { getPackageList } from '@/api/servicePackage'
import ServiceCard from '@/components/ServiceCard.vue'
import PackageCard from '@/components/PackageCard.vue'
import EmptyState from '@/components/EmptyState.vue'

const shopInfo = ref({})
const categories = ref([])
const hotServices = ref([])
const packages = ref([])
const loading = ref(false)

const statusText = computed(() => {
  return shopInfo.value.businessStatus === 1 ? '营业中' : '休息中'
})

const statusClass = computed(() => {
  return shopInfo.value.businessStatus === 1 ? 'shop-banner__status--open' : 'shop-banner__status--closed'
})

async function loadData() {
  loading.value = true
  try {
    const [shop, cats, services, pkgs] = await Promise.all([
      getShopStatus(),
      getCategoryList(1),
      getServiceItemList({}),
      getPackageList({})
    ])
    shopInfo.value = shop || {}
    categories.value = cats || []
    hotServices.value = (services || []).slice(0, 6)
    packages.value = pkgs || []
  } catch (e) {
    console.error('loadData error:', e)
    uni.showToast({ icon: 'none', title: '加载失败' })
  } finally {
    loading.value = false
  }
}

function callPhone() {
  if (!shopInfo.value.phone) return
  uni.makePhoneCall({ phoneNumber: shopInfo.value.phone })
}

function copyAddress() {
  if (!shopInfo.value.address) return
  uni.setClipboardData({
    data: shopInfo.value.address,
    success() {
      uni.showToast({ icon: 'none', title: '地址已复制' })
    }
  })
}

function goToServiceList(categoryId) {
  uni.switchTab({ url: '/pages/service/list' })
  if (categoryId) {
    uni.$emit('switchCategory', { categoryId })
  }
}

function goToServiceDetail(id) {
  uni.navigateTo({ url: `/pages/service/detail?id=${id}` })
}

function goToPackageDetail(id) {
  uni.navigateTo({ url: `/pages/service/detail?id=${id}&isPackage=1` })
}

onLoad(() => {
  uni.showLoading({ title: '加载中...' })
  loadData().finally(() => {
    uni.hideLoading()
  })
})

onPullDownRefresh(async () => {
  await loadData()
  uni.stopPullDownRefresh()
})
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: $p-bg-page;
  padding-bottom: 40rpx;
}

/* Shop Banner */
.shop-banner {
  background: linear-gradient(135deg, $p-primary 0%, $p-primary-dark 100%);
  padding: 48rpx 32rpx 40rpx;

  &__content {
    display: flex;
    align-items: center;
  }

  &__logo {
    width: 120rpx;
    height: 120rpx;
    border-radius: $p-radius-lg;
    flex-shrink: 0;
    background: rgba(255, 255, 255, 0.2);
  }

  &__info {
    flex: 1;
    margin-left: 28rpx;
  }

  &__name {
    font-size: 40rpx;
    font-weight: 700;
    color: #ffffff;
    display: block;
  }

  &__status {
    display: inline-flex;
    align-items: center;
    margin-top: 12rpx;
    padding: 4rpx 16rpx;
    border-radius: $p-radius-round;
    font-size: 24rpx;

    &--open {
      background: rgba(0, 180, 42, 0.2);
    }

    &--closed {
      background: rgba(255, 125, 0, 0.2);
    }
  }

  &__status-text {
    font-size: 24rpx;
    color: #ffffff;
  }
}

/* Shop Contact */
.shop-contact {
  background: $p-bg-card;
  margin: -20rpx 24rpx 0;
  border-radius: $p-radius-lg;
  padding: 24rpx 28rpx;
  box-shadow: $p-shadow-card;
  position: relative;
  z-index: 1;

  &__item {
    display: flex;
    align-items: center;
    padding: 12rpx 0;

    &:first-child {
      padding-top: 0;
    }

    &:last-child {
      padding-bottom: 0;
    }
  }

  &__icon {
    font-size: 32rpx;
    color: $p-primary;
    margin-right: 16rpx;
    flex-shrink: 0;
    width: 32rpx;
    text-align: center;
  }

  &__text {
    font-size: 26rpx;
    color: $p-text-2;
    flex: 1;
  }
}

/* Section */
.section {
  margin-top: 32rpx;
  padding: 0 24rpx;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24rpx;
  }

  &__title {
    font-size: 34rpx;
    font-weight: 700;
    color: $p-text-1;
  }

  &__more {
    display: flex;
    align-items: center;
  }

  &__more-text {
    font-size: 26rpx;
    color: $p-text-3;
  }

  &__more-arrow {
    font-size: 26rpx;
    color: $p-text-3;
    margin-left: 4rpx;
  }
}

/* Category Scroll */
.category-scroll {
  white-space: nowrap;

  &__inner {
    display: flex;
    gap: 24rpx;
    padding: 8rpx 0;
  }
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: 128rpx;

  &__icon {
    width: 96rpx;
    height: 96rpx;
    border-radius: 50%;
    background: $p-primary-light;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__icon-text {
    font-size: 36rpx;
    font-weight: 600;
    color: $p-primary;
  }

  &__name {
    font-size: 24rpx;
    color: $p-text-2;
    margin-top: 12rpx;
    max-width: 128rpx;
    text-align: center;
  }
}

/* Hot Services */
.hot-services {
  display: flex;
  flex-direction: column;
}

/* Package Scroll */
.package-scroll {
  white-space: nowrap;
  margin: 0 -24rpx;
  padding: 0 24rpx;

  &__inner {
    display: flex;
    gap: 20rpx;
    padding-right: 24rpx;
  }
}

.package-scroll__inner :deep(.package-card) {
  width: 400rpx;
  flex-shrink: 0;
  display: inline-block;
  white-space: normal;
}
</style>
