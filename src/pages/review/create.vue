<template>
  <view class="page">
    <!-- Appointment Summary -->
    <view class="summary-card" v-if="appointment">
      <view class="summary-card__row">
        <text class="summary-card__label">服务项目</text>
        <text class="summary-card__value">{{ appointment.serviceName }}</text>
      </view>
      <view class="summary-card__row">
        <text class="summary-card__label">服务人员</text>
        <text class="summary-card__value">{{ appointment.staffName }}</text>
      </view>
      <view class="summary-card__row">
        <text class="summary-card__label">预约时间</text>
        <text class="summary-card__value">{{ formatDate(appointment.appointmentDate) }} {{ appointment.timeSlotName }}</text>
      </view>
    </view>

    <!-- Star Rating -->
    <view class="section">
      <text class="section__title">服务评分</text>
      <view class="rating-stars">
        <text
          v-for="i in 5"
          :key="i"
          :class="['star', { 'is-active': i <= score }]"
          @click="score = i"
        >{{ i <= score ? '★' : '☆' }}</text>
      </view>
    </view>

    <!-- Content -->
    <view class="section">
      <text class="section__title">评价内容</text>
      <view class="textarea-wrap">
        <textarea
          class="textarea"
          v-model="content"
          placeholder="请分享您的服务体验..."
          :maxlength="500"
          :auto-height="false"
        />
        <text class="textarea-count">{{ content.length }}/500</text>
      </view>
    </view>

    <!-- Image Upload -->
    <view class="section">
      <text class="section__title">上传图片 <text class="section__hint">(最多3张)</text></text>
      <view class="image-grid">
        <view class="image-item" v-for="(img, idx) in imageList" :key="idx">
          <image class="image-item__img" :src="img" mode="aspectFill" @click="previewImage(idx)" />
          <text class="image-item__remove" @click="removeImage(idx)">×</text>
        </view>
        <view class="image-add" v-if="imageList.length < 3" @click="chooseImage">
          <text class="image-add__icon">+</text>
        </view>
      </view>
    </view>

    <!-- Submit Button -->
    <view class="bottom-bar">
      <view class="submit-btn" :class="{ 'is-disabled': submitting }" @click="handleSubmit">
        <text class="submit-btn__text">{{ submitting ? '提交中...' : '提交评价' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getAppointmentDetail } from '@/api/appointment'
import { submitReview } from '@/api/review'
import { formatDate } from '@/utils/format'

const appointmentId = ref('')
const appointment = ref(null)
const score = ref(0)
const content = ref('')
const imageList = ref([])
const submitting = ref(false)

onLoad((options) => {
  if (options.appointmentId) {
    appointmentId.value = options.appointmentId
    loadAppointment()
  }
})

async function loadAppointment() {
  uni.showLoading({ title: '加载中' })
  try {
    appointment.value = await getAppointmentDetail(appointmentId.value)
  } catch (e) {
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

function chooseImage() {
  const remaining = 3 - imageList.value.length
  if (remaining <= 0) return
  uni.chooseImage({
    count: remaining,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      imageList.value = [...imageList.value, ...res.tempFilePaths]
    }
  })
}

function previewImage(index) {
  uni.previewImage({
    urls: imageList.value,
    current: imageList.value[index]
  })
}

function removeImage(index) {
  imageList.value.splice(index, 1)
}

async function handleSubmit() {
  if (submitting.value) return
  if (score.value === 0) {
    uni.showToast({ title: '请选择评分', icon: 'none' })
    return
  }
  if (!content.value.trim()) {
    uni.showToast({ title: '请输入评价内容', icon: 'none' })
    return
  }

  submitting.value = true
  uni.showLoading({ title: '提交中' })
  try {
    await submitReview({
      appointmentId: appointmentId.value,
      score: score.value,
      content: content.value.trim(),
      images: imageList.value
    })
    uni.hideLoading()
    uni.showToast({ title: '评价成功', icon: 'success' })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (e) {
    uni.hideLoading()
    uni.showToast({ title: e.message || '提交失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: $p-bg-page;
  padding: 24rpx;
  padding-bottom: 160rpx;
}

.summary-card {
  background: $p-bg-card;
  border-radius: $p-radius-lg;
  padding: 28rpx;
  box-shadow: $p-shadow-card;
  margin-bottom: 24rpx;

  &__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12rpx 0;

    &:not(:last-child) {
      border-bottom: 1rpx solid $p-border-light;
    }
  }

  &__label {
    font-size: 26rpx;
    color: $p-text-3;
  }

  &__value {
    font-size: 26rpx;
    color: $p-text-1;
    font-weight: 500;
  }
}

.section {
  background: $p-bg-card;
  border-radius: $p-radius-lg;
  padding: 28rpx;
  box-shadow: $p-shadow-card;
  margin-bottom: 24rpx;

  &__title {
    font-size: 30rpx;
    font-weight: 600;
    color: $p-text-1;
    margin-bottom: 24rpx;
    display: block;
  }

  &__hint {
    font-size: 24rpx;
    color: $p-text-3;
    font-weight: 400;
  }
}

.rating-stars {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.star {
  font-size: 56rpx;
  color: $p-text-4;
  line-height: 1;
  transition: color 0.15s;

  &.is-active {
    color: #FFC000;
  }
}

.textarea-wrap {
  position: relative;
}

.textarea {
  width: 100%;
  height: 240rpx;
  background: $p-bg-page;
  border-radius: $p-radius;
  padding: 20rpx;
  font-size: 28rpx;
  color: $p-text-1;
  line-height: 1.6;
  box-sizing: border-box;
}

.textarea-count {
  position: absolute;
  right: 16rpx;
  bottom: 12rpx;
  font-size: 22rpx;
  color: $p-text-4;
}

.image-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.image-item {
  position: relative;
  width: 200rpx;
  height: 200rpx;

  &__img {
    width: 100%;
    height: 100%;
    border-radius: $p-radius;
  }

  &__remove {
    position: absolute;
    top: -12rpx;
    right: -12rpx;
    width: 40rpx;
    height: 40rpx;
    background: $p-danger;
    color: #fff;
    font-size: 28rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    text-align: center;
  }
}

.image-add {
  width: 200rpx;
  height: 200rpx;
  background: $p-bg-page;
  border: 2rpx dashed $p-border-light;
  border-radius: $p-radius;
  display: flex;
  align-items: center;
  justify-content: center;

  &__icon {
    font-size: 64rpx;
    color: $p-text-4;
    line-height: 1;
  }
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 20rpx 32rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: $p-bg-card;
  box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.submit-btn {
  background: $p-primary;
  border-radius: $p-radius-round;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  &.is-disabled {
    opacity: 0.6;
  }

  &__text {
    font-size: 32rpx;
    font-weight: 600;
    color: #fff;
  }
}
</style>
