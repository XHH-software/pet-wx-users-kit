<template>
  <view class="page">
    <!-- Status Tabs -->
    <view class="tabs-wrap">
      <scroll-view scroll-x class="tabs-scroll" :scroll-into-view="'tab-' + activeTabIndex">
        <view class="tabs">
          <view
            v-for="(tab, idx) in tabs"
            :key="tab.value"
            :id="'tab-' + idx"
            :class="['tab-item', { 'is-active': activeTab === tab.value }]"
            @click="switchTab(tab.value)"
          >
            <text class="tab-item__text">{{ tab.label }}</text>
            <view v-if="activeTab === tab.value" class="tab-item__indicator" />
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- Appointment List -->
    <scroll-view
      v-if="list.length > 0"
      class="list-scroll"
      scroll-y
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="loadMore"
    >
      <view class="list">
        <view
          v-for="item in list"
          :key="item.id"
          class="order-card"
          @click="goDetail(item.id)"
        >
          <view class="order-card__header">
            <text class="order-card__no">{{ item.orderNo }}</text>
            <StatusTag :value="item.status" dict="appointment" />
          </view>

          <view class="order-card__body">
            <view class="order-card__service">
              <image
                class="order-card__service-img"
                :src="item.serviceItemIcon || '/static/images/pet-default.png'"
                mode="aspectFill"
              />
              <view class="order-card__service-info">
                <text class="order-card__service-name">{{ item.serviceItemName }}</text>
                <text class="order-card__staff">{{ item.staffName }}</text>
              </view>
            </view>

            <view class="order-card__detail">
              <view class="order-card__row">
                <text class="order-card__label">预约时间</text>
                <text class="order-card__val">{{ item.appointmentDate }} {{ item.startTime }}</text>
              </view>
              <view class="order-card__row">
                <text class="order-card__label">费用</text>
                <text class="order-card__val order-card__val--price">¥{{ formatPrice(item.totalAmount) }}</text>
              </view>
            </view>
          </view>

          <view class="order-card__footer">
            <text class="order-card__time">{{ formatDateTime(item.createTime) }}</text>
            <view class="order-card__actions">
              <view
                v-if="item.status === APPOINTMENT_STATUS.PENDING_PAY"
                class="order-card__btn order-card__btn--primary"
                @click.stop="handlePay(item)"
              >
                <text class="order-card__btn-text">去支付</text>
              </view>
              <view
                v-if="item.status === APPOINTMENT_STATUS.PENDING_SERVICE"
                class="order-card__btn order-card__btn--default"
                @click.stop="handleCancel(item)"
              >
                <text class="order-card__btn-text--default">取消预约</text>
              </view>
              <view
                v-if="item.status === APPOINTMENT_STATUS.COMPLETED && !item.hasReview"
                class="order-card__btn order-card__btn--primary"
                @click.stop="goReview(item.id)"
              >
                <text class="order-card__btn-text">去评价</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- Load more -->
      <view v-if="loadingMore" class="load-more">
        <text class="load-more__text">加载中...</text>
      </view>
      <view v-else-if="noMore" class="load-more">
        <text class="load-more__text">没有更多了</text>
      </view>
    </scroll-view>

    <!-- Empty State -->
    <EmptyState
      v-else-if="!pageLoading"
      :description="emptyText"
    />

    <!-- Loading -->
    <view v-if="pageLoading && list.length === 0" class="loading-wrap">
      <text class="loading-text">加载中...</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow, onPullDownRefresh as onPullDownRefreshHook } from '@dcloudio/uni-app'
import { getAppointmentPage, payAppointment, cancelAppointment } from '@/api/appointment'
import { APPOINTMENT_STATUS } from '@/constants/enums'
import { formatPrice, formatDateTime } from '@/utils/format'
import StatusTag from '@/components/StatusTag.vue'
import EmptyState from '@/components/EmptyState.vue'

const tabs = [
  { value: '', label: '全部' },
  { value: APPOINTMENT_STATUS.PENDING_PAY, label: '待支付' },
  { value: APPOINTMENT_STATUS.PENDING_SERVICE, label: '待服务' },
  { value: APPOINTMENT_STATUS.SERVING, label: '服务中' },
  { value: APPOINTMENT_STATUS.COMPLETED, label: '已完成' },
  { value: APPOINTMENT_STATUS.REVIEWED, label: '已评价' }
]

const activeTab = ref('')
const activeTabIndex = computed(() => tabs.findIndex((t) => t.value === activeTab.value))

const list = ref([])
const page = ref(1)
const pageSize = 10
const total = ref(0)
const pageLoading = ref(false)
const refreshing = ref(false)
const loadingMore = ref(false)
const noMore = computed(() => list.value.length >= total.value && total.value > 0)

const emptyText = computed(() => {
  const tab = tabs.find((t) => t.value === activeTab.value)
  return tab?.value ? `暂无${tab.label}的预约` : '暂无预约记录'
})

async function fetchList(reset = false) {
  if (reset) {
    page.value = 1
    list.value = []
  }
  pageLoading.value = true
  try {
    const params = {
      page: page.value,
      pageSize
    }
    if (activeTab.value !== '') {
      params.status = activeTab.value
    }
    const data = await getAppointmentPage(params)
    const records = data?.records || []
    if (reset) {
      list.value = records
    } else {
      list.value = [...list.value, ...records]
    }
    total.value = data?.total || 0
  } catch (e) {
    console.error('获取预约列表失败', e)
  } finally {
    pageLoading.value = false
    refreshing.value = false
    loadingMore.value = false
  }
}

function switchTab(value) {
  if (activeTab.value === value) return
  activeTab.value = value
  fetchList(true)
}

function loadMore() {
  if (loadingMore.value || noMore.value) return
  loadingMore.value = true
  page.value++
  fetchList()
}

async function onRefresh() {
  refreshing.value = true
  await fetchList(true)
  uni.stopPullDownRefresh()
}

// Actions
function goDetail(id) {
  uni.navigateTo({ url: `/pages/appointment/detail?id=${id}` })
}

function handlePay(item) {
  uni.showModal({
    title: '确认支付',
    content: `确认支付 ¥${formatPrice(item.totalAmount)} ？`,
    success: async (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '支付中...' })
        try {
          await payAppointment(item.id)
          uni.showToast({ title: '支付成功', icon: 'success' })
          await fetchList(true)
        } catch (e) {
          uni.showToast({ title: '支付失败', icon: 'none' })
        } finally {
          uni.hideLoading()
        }
      }
    }
  })
}

function handleCancel(item) {
  uni.showModal({
    title: '取消预约',
    content: '确定要取消该预约吗？',
    editable: true,
    placeholderText: '请输入取消原因',
    success: async (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '取消中...' })
        try {
          await cancelAppointment(item.id, { cancelReason: res.content || '用户主动取消' })
          uni.showToast({ title: '已取消', icon: 'success' })
          await fetchList(true)
        } catch (e) {
          uni.showToast({ title: '取消失败', icon: 'none' })
        } finally {
          uni.hideLoading()
        }
      }
    }
  })
}

function goReview(appointmentId) {
  uni.navigateTo({ url: `/pages/review/create?appointmentId=${appointmentId}` })
}

onShow(() => {
  fetchList(true)
})

onPullDownRefreshHook(() => {
  refreshing.value = true
  fetchList(true).then(() => {
    uni.stopPullDownRefresh()
  })
})
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: $p-bg-page;
  display: flex;
  flex-direction: column;
}

/* Tabs */
.tabs-wrap {
  background: $p-bg-card;
  box-shadow: $p-shadow-card;
  position: sticky;
  top: 0;
  z-index: 10;
}

.tabs-scroll {
  white-space: nowrap;
}

.tabs {
  display: inline-flex;
  padding: 0 16rpx;
}

.tab-item {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx 24rpx 20rpx;
  position: relative;

  &__text {
    font-size: 28rpx;
    color: $p-text-2;
    white-space: nowrap;

    .is-active & {
      color: $p-primary;
      font-weight: 600;
    }
  }

  &__indicator {
    position: absolute;
    bottom: 0;
    width: 48rpx;
    height: 4rpx;
    border-radius: 2rpx;
    background: $p-primary;
  }
}

/* List */
.list-scroll {
  flex: 1;
  height: 0;
}

.list {
  padding: 24rpx;
  padding-bottom: 40rpx;
}

.order-card {
  background: $p-bg-card;
  border-radius: $p-radius-lg;
  box-shadow: $p-shadow-card;
  margin-bottom: 20rpx;
  overflow: hidden;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24rpx 24rpx 0;
  }

  &__no {
    font-size: 24rpx;
    color: $p-text-3;
    font-family: 'DIN Alternate', 'Helvetica Neue', sans-serif;
  }

  &__body {
    padding: 20rpx 24rpx;
  }

  &__service {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;
  }

  &__service-img {
    width: 88rpx;
    height: 88rpx;
    border-radius: $p-radius;
    flex-shrink: 0;
    background: $p-bg-page;
  }

  &__service-info {
    margin-left: 20rpx;
    flex: 1;
  }

  &__service-name {
    font-size: 30rpx;
    font-weight: 600;
    color: $p-text-1;
    display: block;
  }

  &__staff {
    font-size: 24rpx;
    color: $p-text-3;
    margin-top: 6rpx;
    display: block;
  }

  &__detail {
    background: $p-bg-page;
    border-radius: $p-radius;
    padding: 16rpx 20rpx;
  }

  &__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6rpx 0;
  }

  &__label {
    font-size: 24rpx;
    color: $p-text-3;
  }

  &__val {
    font-size: 24rpx;
    color: $p-text-1;

    &--price {
      color: $p-danger;
      font-weight: 600;
      font-size: 28rpx;
    }
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16rpx 24rpx 24rpx;
    border-top: 1rpx solid $p-border-light;
    margin: 0 24rpx;
    padding-left: 0;
    padding-right: 0;
  }

  &__time {
    font-size: 22rpx;
    color: $p-text-3;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 16rpx;
  }

  &__btn {
    padding: 10rpx 28rpx;
    border-radius: $p-radius-round;
    border: 2rpx solid transparent;

    &--primary {
      background: $p-primary;
      border-color: $p-primary;
    }

    &--default {
      background: $p-bg-page;
      border-color: $p-border-light;
    }

    &:active {
      opacity: 0.8;
    }
  }

  &__btn-text {
    font-size: 24rpx;
    color: #FFFFFF;
    font-weight: 500;

    &--default {
      font-size: 24rpx;
      color: $p-text-2;
      font-weight: 500;
    }
  }
}

/* Load more */
.load-more {
  text-align: center;
  padding: 32rpx 0;

  &__text {
    font-size: 24rpx;
    color: $p-text-3;
  }
}

/* Loading */
.loading-wrap {
  display: flex;
  justify-content: center;
  padding: 120rpx 0;
}

.loading-text {
  font-size: 28rpx;
  color: $p-text-3;
}
</style>
