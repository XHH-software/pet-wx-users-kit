<template>
  <view class="page">
    <!-- User Info Card -->
    <view class="user-card">
      <view class="user-card__info" @click="handleLogin">
        <image
          class="user-card__avatar"
          :src="userStore.avatar || '/static/images/default-avatar.png'"
          mode="aspectFill"
        />
        <view class="user-card__meta">
          <text class="user-card__name">{{ userStore.isLogin ? userStore.nickname : '点击登录' }}</text>
          <text class="user-card__phone" v-if="userStore.isLogin && phone">{{ phone }}</text>
        </view>
        <text class="user-card__arrow" v-if="!userStore.isLogin">›</text>
      </view>
    </view>

    <!-- Menu List -->
    <view class="menu-card">
      <view class="menu-item" @click="navigateTo('/pages/pet/list')">
        <text class="menu-item__icon">🐾</text>
        <text class="menu-item__label">我的宠物</text>
        <text class="menu-item__arrow">›</text>
      </view>
      <view class="menu-item" @click="navigateTo('/pages/address/list')">
        <text class="menu-item__icon">📍</text>
        <text class="menu-item__label">地址管理</text>
        <text class="menu-item__arrow">›</text>
      </view>
      <view class="menu-item" @click="navigateTo('/pages/review/list')">
        <text class="menu-item__icon">⭐</text>
        <text class="menu-item__label">我的评价</text>
        <text class="menu-item__arrow">›</text>
      </view>
      <view class="menu-item" @click="callService">
        <text class="menu-item__icon">📞</text>
        <text class="menu-item__label">联系客服</text>
        <text class="menu-item__arrow">›</text>
      </view>
      <view class="menu-item" @click="showAbout">
        <text class="menu-item__icon">ℹ️</text>
        <text class="menu-item__label">关于我们</text>
        <text class="menu-item__arrow">›</text>
      </view>
    </view>

    <!-- Logout Button -->
    <view class="logout-btn" v-if="userStore.isLogin" @click="handleLogout">
      <text class="logout-btn__text">退出登录</text>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import { formatPhone } from '@/utils/format'

const userStore = useUserStore()

const phone = computed(() => {
  return userStore.userInfo?.phone ? formatPhone(userStore.userInfo.phone) : ''
})

onShow(() => {
  // User info is reactive from store, no extra fetch needed
})

function handleLogin() {
  if (userStore.isLogin) return
  userStore.wxLogin().catch(() => {
    uni.showToast({ title: '登录失败', icon: 'none' })
  })
}

function navigateTo(url) {
  uni.navigateTo({ url })
}

function callService() {
  uni.makePhoneCall({
    phoneNumber: '400-123-4567',
    fail: () => {}
  })
}

function showAbout() {
  uni.showModal({
    title: '关于我们',
    content: '宠物服务预约平台 v1.0.0\n\n为您提供专业的宠物护理服务预约，包括宠物洗护、美容、寄养等一站式服务。',
    showCancel: false,
    confirmText: '知道了'
  })
}

function handleLogout() {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
        uni.reLaunch({ url: '/pages/index/index' })
      }
    }
  })
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: $p-bg-page;
  padding: 24rpx;
}

.user-card {
  background: linear-gradient(135deg, $p-primary, $p-primary-dark);
  border-radius: $p-radius-lg;
  padding: 40rpx 32rpx;
  margin-bottom: 24rpx;
  box-shadow: $p-shadow-card;

  &__info {
    display: flex;
    align-items: center;
  }

  &__avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    border: 4rpx solid rgba(255, 255, 255, 0.5);
    background: rgba(255, 255, 255, 0.2);
    flex-shrink: 0;
  }

  &__meta {
    flex: 1;
    margin-left: 28rpx;
    display: flex;
    flex-direction: column;
  }

  &__name {
    font-size: 36rpx;
    font-weight: 700;
    color: #fff;
    line-height: 1.4;
  }

  &__phone {
    font-size: 26rpx;
    color: rgba(255, 255, 255, 0.8);
    margin-top: 8rpx;
  }

  &__arrow {
    font-size: 48rpx;
    color: rgba(255, 255, 255, 0.7);
    line-height: 1;
  }
}

.menu-card {
  background: $p-bg-card;
  border-radius: $p-radius-lg;
  box-shadow: $p-shadow-card;
  margin-bottom: 40rpx;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 32rpx 28rpx;
  position: relative;

  &:not(:last-child)::after {
    content: '';
    position: absolute;
    left: 28rpx;
    right: 28rpx;
    bottom: 0;
    height: 1rpx;
    background: $p-border-light;
  }

  &__icon {
    font-size: 40rpx;
    width: 52rpx;
    text-align: center;
    flex-shrink: 0;
  }

  &__label {
    flex: 1;
    font-size: 30rpx;
    color: $p-text-1;
    margin-left: 20rpx;
  }

  &__arrow {
    font-size: 36rpx;
    color: $p-text-4;
    line-height: 1;
  }
}

.logout-btn {
  background: $p-bg-card;
  border-radius: $p-radius-lg;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: $p-shadow-card;

  &__text {
    font-size: 30rpx;
    color: $p-danger;
    font-weight: 500;
  }
}
</style>
