<template>
  <view class="page">
    <!-- Step Indicator -->
    <view class="step-bar">
      <view
        v-for="(step, idx) in steps"
        :key="idx"
        :class="['step-bar__item', { 'is-active': currentStep >= idx, 'is-current': currentStep === idx }]"
      >
        <view class="step-bar__circle">
          <text class="step-bar__num">{{ idx + 1 }}</text>
        </view>
        <text class="step-bar__label">{{ step }}</text>
        <view v-if="idx < steps.length - 1" class="step-bar__line" />
      </view>
    </view>

    <!-- Step 1: Select Service -->
    <view v-show="currentStep === 0" class="step-content">
      <view class="section-title">
        <text class="section-title__text">选择服务项目</text>
      </view>

      <!-- Pre-selected service -->
      <view v-if="serviceInfo" class="service-selected">
        <view class="service-card is-selected">
          <view class="service-card__info">
            <text class="service-card__name">{{ serviceInfo.name }}</text>
            <text class="service-card__duration">{{ serviceInfo.duration }}分钟</text>
          </view>
          <view class="service-card__price">
            <PriceDisplay :value="serviceInfo.price" />
          </view>
        </view>
      </view>

      <!-- Service list to choose from -->
      <view v-else class="service-list">
        <view
          v-for="item in serviceList"
          :key="item.id"
          :class="['service-card', { 'is-selected': selectedServiceId === item.id }]"
          @click="selectService(item)"
        >
          <view class="service-card__info">
            <text class="service-card__name">{{ item.name }}</text>
            <text class="service-card__desc">{{ item.description }}</text>
            <text class="service-card__duration">{{ item.duration }}分钟</text>
          </view>
          <view class="service-card__price">
            <PriceDisplay :value="item.price" />
          </view>
        </view>
        <view v-if="!serviceListLoading && serviceList.length === 0" class="empty-wrap">
          <EmptyState description="暂无可用服务项目" />
        </view>
      </view>
    </view>

    <!-- Step 2: Select Pet -->
    <view v-show="currentStep === 1" class="step-content">
      <view class="section-title">
        <text class="section-title__text">选择宠物</text>
      </view>

      <view v-if="petList.length > 0" class="pet-list">
        <view
          v-for="pet in petList"
          :key="pet.id"
          :class="['pet-select-card', { 'is-selected': selectedPetId === pet.id }]"
          @click="selectPet(pet)"
        >
          <view class="pet-select-card__check" v-if="selectedPetId === pet.id">
            <text class="pet-select-card__check-icon">&#10003;</text>
          </view>
          <PetCard :pet="pet" :show-vaccine="true" />
          <view v-if="isPetVaccineExpired(pet)" class="pet-select-card__warn">
            <text class="pet-select-card__warn-text">疫苗已过期，请先更新疫苗信息</text>
          </view>
        </view>
      </view>

      <view v-else-if="!petLoading" class="no-pet">
        <EmptyState description="还没有添加宠物">
          <view class="add-pet-btn" @click="goAddPet">
            <text class="add-pet-btn__text">+ 添加宠物</text>
          </view>
        </EmptyState>
      </view>
    </view>

    <!-- Step 3: Select Time -->
    <view v-show="currentStep === 2" class="step-content">
      <view class="section-title">
        <text class="section-title__text">选择预约时间</text>
      </view>

      <!-- Date horizontal scroll -->
      <scroll-view scroll-x class="date-scroll">
        <view class="date-list">
          <view
            v-for="d in dateOptions"
            :key="d.value"
            :class="['date-item', { 'is-active': selectedDate === d.value }]"
            @click="changeDate(d.value)"
          >
            <text class="date-item__weekday">{{ d.weekday }}</text>
            <text class="date-item__date">{{ d.label }}</text>
          </view>
        </view>
      </scroll-view>

      <!-- Time Slot Picker -->
      <view class="slot-section">
        <view v-if="slotLoading" class="slot-loading">
          <text class="slot-loading__text">加载可用时段...</text>
        </view>
        <TimeSlotPicker
          v-else
          :staff-list="staffList"
          :selected-date="selectedDate"
          @update:selectedDate="changeDate"
          @selectStaff="onSelectStaff"
          @selectSlot="onSelectSlot"
        />
      </view>
    </view>

    <!-- Step 4: Confirm & Pay -->
    <view v-show="currentStep === 3" class="step-content">
      <view class="section-title">
        <text class="section-title__text">确认预约信息</text>
      </view>

      <view class="confirm-card">
        <view class="confirm-row">
          <text class="confirm-row__label">服务项目</text>
          <text class="confirm-row__value">{{ serviceInfo?.name }}</text>
        </view>
        <view class="confirm-row">
          <text class="confirm-row__label">服务时长</text>
          <text class="confirm-row__value">{{ serviceInfo?.duration }}分钟</text>
        </view>
        <view class="confirm-row">
          <text class="confirm-row__label">宠物</text>
          <text class="confirm-row__value">{{ selectedPet?.name }}</text>
        </view>
        <view class="confirm-row">
          <text class="confirm-row__label">服务人员</text>
          <text class="confirm-row__value">{{ selectedStaffName }}</text>
        </view>
        <view class="confirm-row">
          <text class="confirm-row__label">预约日期</text>
          <text class="confirm-row__value">{{ selectedDate }}</text>
        </view>
        <view class="confirm-row">
          <text class="confirm-row__label">预约时间</text>
          <text class="confirm-row__value">{{ selectedTime }}</text>
        </view>
        <view class="confirm-row confirm-row--highlight">
          <text class="confirm-row__label">费用合计</text>
          <PriceDisplay :value="serviceInfo?.price || 0" />
        </view>
      </view>

      <view class="remark-card">
        <text class="remark-card__title">备注</text>
        <textarea
          class="remark-card__input"
          v-model="remark"
          placeholder="请输入备注信息（选填）"
          placeholder-class="remark-placeholder"
          :maxlength="200"
          auto-height
        />
      </view>
    </view>

    <!-- Bottom Navigation Bar -->
    <view class="bottom-bar">
      <view
        v-if="currentStep > 0"
        class="bottom-bar__btn bottom-bar__btn--default"
        @click="prevStep"
      >
        <text class="bottom-bar__btn-text">上一步</text>
      </view>
      <view
        v-if="currentStep < 3"
        :class="['bottom-bar__btn', 'bottom-bar__btn--primary', { 'is-disabled': !canNext }]"
        @click="nextStep"
      >
        <text class="bottom-bar__btn-text bottom-bar__btn-text--white">下一步</text>
      </view>
      <view
        v-if="currentStep === 3"
        :class="['bottom-bar__btn', 'bottom-bar__btn--primary', { 'is-disabled': submitting }]"
        @click="submitOrder"
      >
        <text class="bottom-bar__btn-text bottom-bar__btn-text--white">
          {{ submitting ? '提交中...' : '确认预约' }}
        </text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import dayjs from 'dayjs'
import { getServiceItemList, getServiceItemDetail } from '@/api/serviceItem'
import { getPetList } from '@/api/pet'
import { getAvailableSlots, createAppointment, payAppointment } from '@/api/appointment'
import { isVaccineExpired } from '@/utils/format'
import PriceDisplay from '@/components/PriceDisplay.vue'
import PetCard from '@/components/PetCard.vue'
import TimeSlotPicker from '@/components/TimeSlotPicker.vue'
import EmptyState from '@/components/EmptyState.vue'

const steps = ['选择服务', '选择宠物', '选择时间', '确认预约']
const currentStep = ref(0)

// Step 1: Service
const serviceList = ref([])
const serviceListLoading = ref(false)
const serviceInfo = ref(null)
const selectedServiceId = ref(null)

// Step 2: Pet
const petList = ref([])
const petLoading = ref(false)
const selectedPetId = ref(null)

// Step 3: Time
const dateOptions = ref([])
const selectedDate = ref('')
const staffList = ref([])
const slotLoading = ref(false)
const selectedStaffId = ref(null)
const selectedStaffName = ref('')
const selectedTime = ref('')

// Step 4: Confirm
const remark = ref('')
const submitting = ref(false)

// Computed
const selectedPet = computed(() => petList.value.find((p) => p.id === selectedPetId.value))

const canNext = computed(() => {
  if (currentStep.value === 0) return !!selectedServiceId.value
  if (currentStep.value === 1) {
    if (!selectedPetId.value) return false
    const pet = selectedPet.value
    if (pet && isPetVaccineExpired(pet)) return false
    return true
  }
  if (currentStep.value === 2) return !!selectedStaffId.value && !!selectedTime.value
  return true
})

function isPetVaccineExpired(pet) {
  return isVaccineExpired(pet.vaccineExpiryDate)
}

// Init date options (next 7 days)
function initDateOptions() {
  const weekdayMap = ['日', '一', '二', '三', '四', '五', '六']
  const dates = []
  for (let i = 0; i < 7; i++) {
    const d = dayjs().add(i, 'day')
    const weekday = i === 0 ? '今天' : i === 1 ? '明天' : '周' + weekdayMap[d.day()]
    dates.push({
      value: d.format('YYYY-MM-DD'),
      label: d.format('MM/DD'),
      weekday
    })
  }
  dateOptions.value = dates
  selectedDate.value = dates[0].value
}

// Load service list
async function fetchServiceList() {
  serviceListLoading.value = true
  try {
    const data = await getServiceItemList()
    serviceList.value = data || []
  } catch (e) {
    console.error('获取服务列表失败', e)
  } finally {
    serviceListLoading.value = false
  }
}

// Load service detail (pre-selected)
async function fetchServiceDetail(id) {
  uni.showLoading({ title: '加载中...' })
  try {
    const data = await getServiceItemDetail(id)
    serviceInfo.value = data
    selectedServiceId.value = data.id
  } catch (e) {
    uni.showToast({ title: '服务信息加载失败', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

function selectService(item) {
  serviceInfo.value = item
  selectedServiceId.value = item.id
}

// Load pet list
async function fetchPetList() {
  petLoading.value = true
  try {
    const data = await getPetList()
    petList.value = data || []
  } catch (e) {
    console.error('获取宠物列表失败', e)
  } finally {
    petLoading.value = false
  }
}

function selectPet(pet) {
  if (isPetVaccineExpired(pet)) {
    uni.showToast({ title: '该宠物疫苗已过期，请先更新', icon: 'none' })
    return
  }
  selectedPetId.value = pet.id
}

function goAddPet() {
  uni.navigateTo({ url: '/pages/pet/edit' })
}

// Load available slots
async function fetchSlots() {
  if (!selectedDate.value || !selectedServiceId.value) return
  slotLoading.value = true
  try {
    const data = await getAvailableSlots({
      date: selectedDate.value,
      serviceItemId: selectedServiceId.value
    })
    staffList.value = data || []
    // Reset selection when slots change
    selectedStaffId.value = null
    selectedStaffName.value = ''
    selectedTime.value = ''
  } catch (e) {
    console.error('获取可用时段失败', e)
    staffList.value = []
  } finally {
    slotLoading.value = false
  }
}

function changeDate(date) {
  selectedDate.value = date
  fetchSlots()
}

function onSelectStaff(staffId) {
  selectedStaffId.value = staffId
  const staff = staffList.value.find((s) => s.staffId === staffId)
  selectedStaffName.value = staff?.staffName || ''
  selectedTime.value = ''
}

function onSelectSlot({ staffId, time }) {
  selectedStaffId.value = staffId
  selectedTime.value = time
  const staff = staffList.value.find((s) => s.staffId === staffId)
  selectedStaffName.value = staff?.staffName || ''
}

// Navigation
function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

function nextStep() {
  if (!canNext.value) {
    const tips = ['请选择服务项目', '请选择宠物', '请选择预约时间']
    uni.showToast({ title: tips[currentStep.value], icon: 'none' })
    return
  }
  if (currentStep.value < 3) {
    currentStep.value++
    // Trigger data loading for next step
    if (currentStep.value === 1 && petList.value.length === 0) {
      fetchPetList()
    }
    if (currentStep.value === 2) {
      fetchSlots()
    }
  }
}

// Submit order
async function submitOrder() {
  if (submitting.value) return
  submitting.value = true
  uni.showLoading({ title: '提交预约...' })
  try {
    const result = await createAppointment({
      petId: selectedPetId.value,
      staffId: selectedStaffId.value,
      serviceItemIds: [selectedServiceId.value],
      packageId: null,
      appointmentDate: selectedDate.value,
      startTime: selectedTime.value,
      remark: remark.value
    })
    // Auto pay
    try {
      await payAppointment(result.id)
      uni.showToast({ title: '预约成功', icon: 'success' })
    } catch (payErr) {
      uni.showToast({ title: '预约成功，请稍后支付', icon: 'none' })
    }
    // Navigate to detail
    setTimeout(() => {
      uni.redirectTo({ url: `/pages/appointment/detail?id=${result.id}` })
    }, 500)
  } catch (e) {
    uni.showToast({ title: '预约失败，请重试', icon: 'none' })
  } finally {
    submitting.value = false
    uni.hideLoading()
  }
}

// Watch for pet list page return
watch(() => petList.value, (newVal) => {
  if (newVal.length > 0 && !selectedPetId.value) {
    // Auto-select is not needed, user should pick
  }
})

onLoad((options) => {
  initDateOptions()
  if (options.serviceItemId) {
    selectedServiceId.value = options.serviceItemId
    fetchServiceDetail(options.serviceItemId)
  } else {
    fetchServiceList()
  }
})
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: $p-bg-page;
  padding-bottom: 140rpx;
}

/* Step Indicator */
.step-bar {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  background: $p-bg-card;
  padding: 32rpx 24rpx 28rpx;
  box-shadow: $p-shadow-card;

  &__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    flex: 1;
  }

  &__circle {
    width: 48rpx;
    height: 48rpx;
    border-radius: 50%;
    background: $p-bg-page;
    border: 2rpx solid $p-border-light;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 8rpx;
    transition: all 0.3s;
  }

  &__num {
    font-size: 24rpx;
    color: $p-text-3;
    font-weight: 600;
  }

  &__label {
    font-size: 22rpx;
    color: $p-text-3;
  }

  &__line {
    position: absolute;
    top: 24rpx;
    left: calc(50% + 28rpx);
    width: calc(100% - 56rpx);
    height: 2rpx;
    background: $p-border-light;
  }

  .is-active &__circle {
    background: $p-primary-light;
    border-color: $p-primary;
  }

  .is-active &__num {
    color: $p-primary;
  }

  .is-active &__label {
    color: $p-primary;
  }

  .is-current &__circle {
    background: $p-primary;
    border-color: $p-primary;
  }

  .is-current &__num {
    color: #FFFFFF;
  }

  .is-active &__line {
    background: $p-primary;
  }
}

/* Step Content */
.step-content {
  padding: 24rpx;
}

.section-title {
  margin-bottom: 24rpx;

  &__text {
    font-size: 32rpx;
    font-weight: 700;
    color: $p-text-1;
  }
}

/* Service Cards */
.service-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.service-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: $p-bg-card;
  border-radius: $p-radius-lg;
  padding: 28rpx 24rpx;
  box-shadow: $p-shadow-card;
  border: 2rpx solid transparent;
  transition: all 0.2s;

  &.is-selected {
    border-color: $p-primary;
    background: $p-primary-light;
  }

  &:active {
    opacity: 0.85;
  }

  &__info {
    flex: 1;
  }

  &__name {
    font-size: 30rpx;
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

  &__duration {
    font-size: 24rpx;
    color: $p-text-2;
    margin-top: 6rpx;
    display: block;
  }

  &__price {
    flex-shrink: 0;
    margin-left: 20rpx;
  }
}

.service-selected {
  margin-bottom: 16rpx;
}

.empty-wrap {
  padding: 40rpx 0;
}

/* Pet Selection */
.pet-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.pet-select-card {
  position: relative;
  border: 2rpx solid transparent;
  border-radius: $p-radius-lg;
  transition: all 0.2s;

  &.is-selected {
    border-color: $p-primary;
  }

  &:active {
    opacity: 0.85;
  }

  &__check {
    position: absolute;
    top: 16rpx;
    right: 16rpx;
    width: 40rpx;
    height: 40rpx;
    border-radius: 50%;
    background: $p-primary;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
  }

  &__check-icon {
    font-size: 24rpx;
    color: #FFFFFF;
    font-weight: 700;
  }

  &__warn {
    padding: 12rpx 24rpx;
    background: rgba(245, 63, 63, 0.06);
    border-radius: 0 0 $p-radius-lg $p-radius-lg;
  }

  &__warn-text {
    font-size: 24rpx;
    color: $p-danger;
  }
}

.add-pet-btn {
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

.no-pet {
  padding: 40rpx 0;
}

/* Date Scroll */
.date-scroll {
  white-space: nowrap;
  margin-bottom: 24rpx;
}

.date-list {
  display: inline-flex;
  gap: 16rpx;
  padding: 4rpx 0;
}

.date-item {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 130rpx;
  height: 120rpx;
  background: $p-bg-card;
  border-radius: $p-radius-lg;
  border: 2rpx solid $p-border-light;
  box-shadow: $p-shadow-card;

  &.is-active {
    background: $p-primary;
    border-color: $p-primary;
  }

  &__weekday {
    font-size: 22rpx;
    color: $p-text-3;

    .is-active & {
      color: rgba(255, 255, 255, 0.85);
    }
  }

  &__date {
    font-size: 26rpx;
    font-weight: 600;
    color: $p-text-1;
    margin-top: 4rpx;

    .is-active & {
      color: #FFFFFF;
    }
  }
}

.slot-section {
  margin-top: 8rpx;
}

.slot-loading {
  text-align: center;
  padding: 60rpx 0;

  &__text {
    font-size: 28rpx;
    color: $p-text-3;
  }
}

/* Confirm Card */
.confirm-card {
  background: $p-bg-card;
  border-radius: $p-radius-lg;
  padding: 24rpx;
  box-shadow: $p-shadow-card;
  margin-bottom: 24rpx;
}

.confirm-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;
  border-bottom: 1rpx solid $p-border-light;

  &:last-child {
    border-bottom: none;
  }

  &--highlight {
    padding-top: 24rpx;
    margin-top: 4rpx;
    border-top: 2rpx solid $p-border-light;
    border-bottom: none;
  }

  &__label {
    font-size: 28rpx;
    color: $p-text-3;
  }

  &__value {
    font-size: 28rpx;
    color: $p-text-1;
    font-weight: 500;
  }
}

.remark-card {
  background: $p-bg-card;
  border-radius: $p-radius-lg;
  padding: 24rpx;
  box-shadow: $p-shadow-card;

  &__title {
    font-size: 28rpx;
    font-weight: 600;
    color: $p-text-1;
    display: block;
    margin-bottom: 16rpx;
  }

  &__input {
    width: 100%;
    min-height: 120rpx;
    font-size: 28rpx;
    color: $p-text-1;
    line-height: 1.6;
    padding: 0;
    box-sizing: border-box;
  }
}

.remark-placeholder {
  color: $p-text-4;
  font-size: 28rpx;
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

    &.is-disabled {
      opacity: 0.5;
    }

    &:active {
      opacity: 0.85;
    }
  }

  &__btn-text {
    font-size: 30rpx;
    font-weight: 600;
    color: $p-text-1;

    &--white {
      color: #FFFFFF;
    }
  }
}
</style>
