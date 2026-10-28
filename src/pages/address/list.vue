<template>
  <view class="page">
    <!-- Address List -->
    <scroll-view
      v-if="addressList.length > 0"
      class="address-list"
      scroll-y
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onPullDownRefresh"
    >
      <view
        v-for="item in addressList"
        :key="item.id"
        class="address-card"
      >
        <view class="address-card__body">
          <view class="address-card__top">
            <text class="address-card__name">{{ item.contactName }}</text>
            <text class="address-card__phone">{{ item.contactPhone }}</text>
            <view v-if="item.isDefault" class="address-card__default-tag">
              <text class="address-card__default-text">默认</text>
            </view>
          </view>
          <view class="address-card__addr">
            <text class="address-card__addr-text">
              {{ item.province }}{{ item.city }}{{ item.district }}{{ item.detail }}
            </text>
          </view>
        </view>

        <view class="address-card__actions">
          <view class="action-btn" @click="goEdit(item.id)">
            <text class="action-btn__icon">✎</text>
            <text class="action-btn__text">编辑</text>
          </view>
          <view class="action-btn action-btn--delete" @click="handleDelete(item)">
            <text class="action-btn__icon">✕</text>
            <text class="action-btn__text">删除</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- Empty State -->
    <EmptyState
      v-else-if="!loading"
      description="还没有添加地址"
    >
      <view class="empty-action" @click="goAdd">
        <text class="empty-action__text">去添加地址</text>
      </view>
    </EmptyState>

    <!-- Loading -->
    <view v-if="loading && addressList.length === 0" class="loading-wrap">
      <text class="loading-text">加载中...</text>
    </view>

    <!-- Bottom Add Button -->
    <view class="bottom-bar">
      <view class="add-btn" @click="goAdd">
        <text class="add-btn__text">+ 新增地址</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getAddressList, deleteAddress } from '@/api/address'
import EmptyState from '@/components/EmptyState.vue'

const addressList = ref([])
const loading = ref(false)
const refreshing = ref(false)

async function fetchList() {
  loading.value = true
  try {
    const data = await getAddressList()
    // Sort: default address first
    const list = data || []
    list.sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0))
    addressList.value = list
  } catch (e) {
    console.error('获取地址列表失败', e)
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

async function onPullDownRefresh() {
  refreshing.value = true
  await fetchList()
  uni.stopPullDownRefresh()
}

function goAdd() {
  uni.navigateTo({ url: '/pages/address/edit' })
}

function goEdit(id) {
  uni.navigateTo({ url: `/pages/address/edit?id=${id}` })
}

function handleDelete(item) {
  uni.showModal({
    title: '确认删除',
    content: `确定要删除地址「${item.contactName} ${item.contactPhone}」吗？`,
    success: async (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '删除中...' })
        try {
          await deleteAddress(item.id)
          uni.showToast({ title: '删除成功', icon: 'success' })
          await fetchList()
        } catch (e) {
          uni.showToast({ title: '删除失败', icon: 'none' })
        } finally {
          uni.hideLoading()
        }
      }
    }
  })
}

onShow(() => {
  fetchList()
})
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: $p-bg-page;
  padding: 24rpx;
  padding-bottom: 160rpx;
}

.address-list {
  height: auto;
}

/* ---- Address Card ---- */
.address-card {
  background: $p-bg-card;
  border-radius: $p-radius-lg;
  box-shadow: $p-shadow-card;
  margin-bottom: 20rpx;
  overflow: hidden;

  &__body {
    padding: 28rpx;
  }

  &__top {
    display: flex;
    align-items: center;
    gap: 16rpx;
    flex-wrap: wrap;
  }

  &__name {
    font-size: 30rpx;
    font-weight: 600;
    color: $p-text-1;
  }

  &__phone {
    font-size: 28rpx;
    color: $p-text-2;
  }

  &__default-tag {
    background: $p-primary-light;
    padding: 2rpx 14rpx;
    border-radius: $p-radius-sm;
  }

  &__default-text {
    font-size: 22rpx;
    color: $p-primary;
    font-weight: 500;
  }

  &__addr {
    margin-top: 16rpx;
  }

  &__addr-text {
    font-size: 26rpx;
    color: $p-text-2;
    line-height: 1.5;
  }

  &__actions {
    display: flex;
    border-top: 1rpx solid $p-border-light;
  }
}

/* ---- Action Buttons ---- */
.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 22rpx 0;

  &:first-child {
    border-right: 1rpx solid $p-border-light;
  }

  &--delete {
    color: $p-danger;
  }

  &__icon {
    font-size: 28rpx;
  }

  &__text {
    font-size: 26rpx;
    color: $p-text-2;

    .action-btn--delete & {
      color: $p-danger;
    }
  }
}

/* ---- Bottom Bar ---- */
.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 20rpx 32rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: $p-bg-card;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.add-btn {
  background: $p-primary;
  border-radius: $p-radius-round;
  padding: 24rpx 0;
  text-align: center;

  &__text {
    font-size: 32rpx;
    color: #FFFFFF;
    font-weight: 600;
  }
}

/* ---- Misc ---- */
.loading-wrap {
  display: flex;
  justify-content: center;
  padding: 80rpx 0;
}

.loading-text {
  font-size: 28rpx;
  color: $p-text-3;
}

.empty-action {
  margin-top: 32rpx;
  background: $p-primary;
  padding: 16rpx 48rpx;
  border-radius: $p-radius-round;

  &__text {
    font-size: 28rpx;
    color: #FFFFFF;
    font-weight: 500;
  }
}
</style>
