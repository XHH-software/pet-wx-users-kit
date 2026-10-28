<template>
  <view class="page">
    <!-- Status Banner -->
    <view class="status-banner" :style="{ background: statusBgColor }">
      <text class="status-banner__text">{{ statusLabel }}</text>
      <text class="status-banner__desc">{{ statusDesc }}</text>
    </view>

    <!-- Content -->
    <view class="content" v-if="detail">
      <!-- Order Info -->
      <view class="info-card">
        <view class="info-card__row">
          <text class="info-card__label">订单编号</text>
          <text class="info-card__value info-card__value--mono">{{ detail.orderNo }}</text>
        </view>
        <view class="info-card__row">
          <text class="info-card__label">下单时间</text>
          <text class="info-card__value">{{ formatDateTime(detail.createTime) }}</text>
        </view>
      </view>

      <!-- Service Info -->
      <view class="section">
        <view class="section__title">
          <text class="section__title-text">服务信息</text>
        </view>
        <view class="info-card">
          <view class="service-row">
            <image
              class="service-row__img"
              :src="detail.serviceItemIcon || '/static/images/pet-default.png'"
              mode="aspectFill"
            />
            <view class="service-row__info">
              <text class="service-row__name">{{ detail.serviceItemName }}</text>
              <text class="service-row__duration">{{ detail.duration }}分钟</text>
            </view>
            <view class="service-row__price">
              <PriceDisplay :value="detail.totalAmount" />
            </view>
          </view>
        </view>
      </view>

      <!-- Pet Info -->
      <view class="section">
        <view class="section__title">
          <text class="section__title-text">宠物信息</text>
        </view>
        <view class="info-card">
          <view class="info-card__row">
            <text class="info-card__label">宠物名称</text>
            <text class="info-card__value">{{ detail.petName }}</text>
          </view>
          <view class="info-card__row">
            <text class="info-card__label">品种</text>
            <text class="info-card__value">{{ detail.petSpeciesLabel }} {{ detail.petBreed }}</text>
          </view>
        </view>
      </view>

      <!-- Staff Info -->
      <view class="section">
        <view class="section__title">
          <text class="section__title-text">服务人员</text>
        </view>
        <view class="info-card">
          <view class="staff-row">
            <image
              class="staff-row__avatar"
              :src="detail.staffAvatar || '/static/images/pet-default.png'"
              mode="aspectFill"
            />
            <view class="staff-row__info">
              <text class="staff-row__name">{{ detail.staffName }}</text>
              <text class="staff-row__level">{{ detail.staffLevelLabel }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- Appointment Time -->
      <view class="section">
        <view class="section__title">
          <text class="section__title-text">预约时间</text>
        </view>
        <view class="info-card">
          <view class="info-card__row">
            <text class="info-card__label">预约日期</text>
            <text class="info-card__value">{{ detail.appointmentDate }}</text>
          </view>
          <view class="info-card__row">
            <text class="info-card__label">预约时段</text>
            <text class="info-card__value">{{ detail.startTime }} - {{ detail.endTime }}</text>
          </view>
        </view>
      </view>

      <!-- Payment Info -->
      <view class="section">
        <view class="section__title">
          <text class="section__title-text">支付信息</text>
        </view>
        <view class="info-card">
          <view class="info-card__row">
            <text class="info-card__label">支付金额</text>
            <text class="info-card__value info-card__value--price">¥{{ formatPrice(detail.totalAmount) }}</text>
          </view>
          <view class="info-card__row">
            <text class="info-card__label">支付状态</text>
            <StatusTag :value="detail.payStatus" dict="pay" />
          </view>
          <view class="info-card__row" v-if="detail.payTime">
            <text class="info-card__label">支付时间</text>
            <text class="info-card__value">{{ formatDateTime(detail.payTime) }}</text>
          </view>
        </view>
      </view>

      <!-- Remark -->
      <view class="section" v-if="detail.remark">
        <view class="section__title">
          <text class="section__title-text">备注</text>
        </view>
        <view class="info-card">
          <text class="remark-text">{{ detail.remark }}</text>
        </view>
      </view>

      <!-- Cancel Reason -->
      <view class="section" v-if="detail.status === APPOINTMENT_STATUS.CANCELLED && detail.cancelReason">
        <view class="section__title">
          <text class="section__title-text">取消原因</text>
        </view>
        <view class="info-card">
          <text class="remark-text remark-text--danger">{{ detail.cancelReason }}</text>
        </view>
      </view>
    </view>

    <!-- Bottom Actions -->
    <view class="bottom-bar" v-if="detail && showActions">
      <view
        v-if="detail.status === APPOINTMENT_STATUS.PENDING_PAY || detail.status === APPOINTMENT_STATUS.PENDING_SERVICE"
        class="bottom-bar__btn bottom-bar__btn--default"
        @click="handleCancel"
      >
        <text class="bottom-bar__btn-text--default">取消预约</text>
      </view>
      <view
        v-if="detail.status === APPOINTMENT_STATUS.PENDING_PAY"
        class="bottom-bar__btn bottom-bar__btn--primary"
        @click="handlePay"
      >
        <text class="bottom-bar__btn-text--white">去支付 ¥{{ formatPrice(detail.totalAmount) }}</text>
      </view>
      <view
        v-if="detail.status === APPOINTMENT_STATUS.COMPLETED && !detail.hasReview"
        class="bottom-bar__btn bottom-bar__btn--primary bottom-bar__btn--full"
        @click="goReview"
      >
        <text class="bottom-bar__btn-text--white">去评价</text>
      </view>
    </view>

    <!-- Loading -->
    <view v-if="pageLoading" class="loading-wrap">
      <text class="loading-text">加载中...</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getAppointmentDetail, payAppointment, cancelAppointment } from '@/api/appointment'
import { APPOINTMENT_STATUS } from '@/constants/enums'
import { APPOINTMENT_STATUS_OPTIONS, PAY_STATUS_OPTIONS } from '@/constants/enums'
import { formatPrice, formatDateTime } from '@/utils/format'
import { getLabelByValue, getColorByValue } from '@/constants/dict'
import StatusTag from '@/components/StatusTag.vue'
import PriceDisplay from '@/components/PriceDisplay.vue'

const detail = ref(null)
const pageLoading = ref(false)
const appointmentId = ref(null)

const showActions = computed(() => {
  if (!detail.value) return false
  const s = detail.value.status
  if (s === APPOINTMENT_STATUS.PENDING_PAY) return true
  if (s === APPOINTMENT_STATUS.PENDING_SERVICE) return true
  if (s === APPOINTMENT_STATUS.COMPLETED && !detail.value.hasReview) return true
  return false
})

const statusLabel = computed(() => {
  if (!detail.value) return ''
  return getLabelByValue('appointment', detail.value.status)
})

const statusDesc = computed(() => {
  if (!detail.value) return ''
  const s = detail.value.status
  if (s === APPOINTMENT_STATUS.PENDING_PAY) return '请在15分钟内完成支付，超时将自动取消'
  if (s === APPOINTMENT_STATUS.PENDING_SERVICE) return '预约已确认，请按时到店'
  if (s === APPOINTMENT_STATUS.SERVING) return '服务进行中'
  if (s === APPOINTMENT_STATUS.CANCELLED) return '预约已取消'
  if (s === APPOINTMENT_STATUS.COMPLETED) return '服务已完成'
  if (s === APPOINTMENT_STATUS.REVIEWED) return '已完成评价'
  return ''
})

const statusBgColor = computed(() => {
  if (!detail.value) return '#4080FF'
  const color = getColorByValue('appointment', detail.value.status)
  return color
})

async function fetchDetail() {
  if (!appointmentId.value) return
  pageLoading.value = true
  try {
    const data = await getAppointmentDetail(appointmentId.value)
    detail.value = data
  } catch (e) {
    uni.showToast({ title: '加载失败', icon: 'none' })
    console.error('获取预约详情失败', e)
  } finally {
    pageLoading.value = false
  }
}

function handlePay() {
  uni.showModal({
    title: '确认支付',
    content: `确认支付 ¥${formatPrice(detail.value.totalAmount)} ？`,
    success: async (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '支付中...' })
        try {
          await payAppointment(appointmentId.value)
          uni.showToast({ title: '支付成功', icon: 'success' })
          await fetchDetail()
        } catch (e) {
          uni.showToast({ title: '支付失败', icon: 'none' })
        } finally {
          uni.hideLoading()
        }
      }
    }
  })
}

function handleCancel() {
  uni.showModal({
    title: '取消预约',
    content: '确定要取消该预约吗？取消后不可恢复。',
    editable: true,
    placeholderText: '请输入取消原因',
    success: async (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '取消中...' })
        try {
          await cancelAppointment(appointmentId.value, {
            cancelReason: res.content || '用户主动取消'
          })
          uni.showToast({ title: '已取消', icon: 'success' })
          await fetchDetail()
        } catch (e) {
          uni.showToast({ title: '取消失败', icon: 'none' })
        } finally {
          uni.hideLoading()
        }
      }
    }
  })
}

function goReview() {
  uni.navigateTo({
    url: `/pages/review/create?appointmentId=${appointmentId.value}`
  })
}

onLoad((options) => {
  if (options.id) {
    appointmentId.value = options.id
    fetchDetail()
  }
})
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: $p-bg-page;
  padding-bottom: 140rpx;
}

/* Status Banner */
.status-banner {
  padding: 48rpx 32rpx 40rpx;
  color: #FFFFFF;

  &__text {
    font-size: 40rpx;
    font-weight: 700;
    display: block;
  }

  &__desc {
    font-size: 26rpx;
    opacity: 0.85;
    margin-top: 8rpx;
    display: block;
  }
}

/* Content */
.content {
  padding: 0 24rpx 24rpx;
  margin-top: -20rpx;
}

/* Section */
.section {
  margin-top: 24rpx;

  &__title {
    padding: 20rpx 24rpx 12rpx;
  }

  &__title-text {
    font-size: 28rpx;
    font-weight: 600;
    color: $p-text-1;
  }
}

/* Info Card */
.info-card {
  background: $p-bg-card;
  border-radius: $p-radius-lg;
  padding: 8rpx 24rpx;
  box-shadow: $p-shadow-card;

  &__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 22rpx 0;
    border-bottom: 1rpx solid $p-border-light;

    &:last-child {
      border-bottom: none;
    }
  }

  &__label {
    font-size: 26rpx;
    color: $p-text-3;
    flex-shrink: 0;
  }

  &__value {
    font-size: 26rpx;
    color: $p-text-1;
    text-align: right;
    margin-left: 24rpx;

    &--mono {
      font-family: 'DIN Alternate', 'Helvetica Neue', sans-serif;
      font-weight: 500;
    }

    &--price {
      color: $p-danger;
      font-weight: 600;
      font-size: 30rpx;
    }
  }
}

/* Service Row */
.service-row {
  display: flex;
  align-items: center;
  padding: 20rpx 0;

  &__img {
    width: 96rpx;
    height: 96rpx;
    border-radius: $p-radius;
    flex-shrink: 0;
    background: $p-bg-page;
  }

  &__info {
    flex: 1;
    margin-left: 20rpx;
  }

  &__name {
    font-size: 30rpx;
    font-weight: 600;
    color: $p-text-1;
    display: block;
  }

  &__duration {
    font-size: 24rpx;
    color: $p-text-3;
    margin-top: 8rpx;
    display: block;
  }

  &__price {
    flex-shrink: 0;
    margin-left: 16rpx;
  }
}

/* Staff Row */
.staff-row {
  display: flex;
  align-items: center;
  padding: 20rpx 0;

  &__avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    flex-shrink: 0;
    background: $p-bg-page;
  }

  &__info {
    margin-left: 20rpx;
  }

  &__name {
    font-size: 28rpx;
    font-weight: 600;
    color: $p-text-1;
    display: block;
  }

  &__level {
    font-size: 24rpx;
    color: $p-text-3;
    margin-top: 4rpx;
    display: block;
  }
}

/* Remark */
.remark-text {
  font-size: 26rpx;
  color: $p-text-2;
  line-height: 1.6;
  padding: 16rpx 0;
  display: block;

  &--danger {
    color: $p-danger;
  }
}

/* Bottom Bar */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 20rpx 32rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: $p-bg-card;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.04);
  z-index: 100;

  &__btn {
    flex: 1;
    height: 88rpx;
    border-radius: $p-radius-round;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;

    &--default {
      background: $p-bg-page;
      border: 2rpx solid $p-border-light;
    }

    &--primary {
      background: $p-primary;
    }

    &--full {
      flex: 1;
    }

    &:active {
      opacity: 0.8;
    }
  }

  &__btn-text--default {
    font-size: 30rpx;
    font-weight: 600;
    color: $p-text-2;
  }

  &__btn-text--white {
    font-size: 30rpx;
    font-weight: 600;
    color: #FFFFFF;
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
