<template>
  <view class="time-slot-picker">
    <view class="time-slot-picker__header">
      <view class="time-slot-picker__date-nav">
        <text class="time-slot-picker__arrow" @click="prevDay">‹</text>
        <text class="time-slot-picker__date">{{ displayDate }}</text>
        <text class="time-slot-picker__arrow" @click="nextDay">›</text>
      </view>
    </view>

    <scroll-view scroll-x class="time-slot-picker__staff-scroll" v-if="staffList.length > 1">
      <view class="time-slot-picker__staff-list">
        <view
          v-for="staff in staffList"
          :key="staff.staffId"
          :class="['time-slot-picker__staff-item', { 'is-active': selectedStaffId === staff.staffId }]"
          @click="selectStaff(staff.staffId)"
        >
          <image class="time-slot-picker__staff-avatar" :src="staff.avatar || '/static/images/pet-default.png'" mode="aspectFill" />
          <text class="time-slot-picker__staff-name">{{ staff.staffName }}</text>
          <text class="time-slot-picker__staff-level">{{ staff.levelLabel }}</text>
        </view>
      </view>
    </scroll-view>

    <view class="time-slot-picker__slots" v-if="currentSlots.length > 0">
      <view
        v-for="slot in currentSlots"
        :key="slot"
        :class="['time-slot-picker__slot', { 'is-selected': selectedTime === slot }]"
        @click="selectSlot(slot)"
      >
        <text>{{ slot }}</text>
      </view>
    </view>

    <view class="time-slot-picker__empty" v-else>
      <text>当日暂无可预约时段</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import { getLabelByValue } from '@/constants/dict'

const props = defineProps({
  staffList: { type: Array, default: () => [] },
  selectedDate: { type: String, default: '' }
})

const emit = defineEmits(['update:selectedDate', 'selectStaff', 'selectSlot'])

const selectedStaffId = ref(props.staffList.length > 0 ? props.staffList[0].staffId : null)
const selectedTime = ref('')

const displayDate = computed(() => {
  const d = props.selectedDate || dayjs().format('YYYY-MM-DD')
  const today = dayjs().format('YYYY-MM-DD')
  if (d === today) return '今天 ' + d
  const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD')
  if (d === tomorrow) return '明天 ' + d
  return dayjs(d).format('MM月DD日 ddd')
})

const currentSlots = computed(() => {
  const staff = props.staffList.find((s) => s.staffId === selectedStaffId.value)
  return staff?.slots || []
})

function prevDay() {
  const d = dayjs(props.selectedDate || dayjs()).subtract(1, 'day').format('YYYY-MM-DD')
  emit('update:selectedDate', d)
}

function nextDay() {
  const d = dayjs(props.selectedDate || dayjs()).add(1, 'day').format('YYYY-MM-DD')
  emit('update:selectedDate', d)
}

function selectStaff(staffId) {
  selectedStaffId.value = staffId
  selectedTime.value = ''
  emit('selectStaff', staffId)
}

function selectSlot(slot) {
  selectedTime.value = slot
  emit('selectSlot', { staffId: selectedStaffId.value, time: slot })
}
</script>

<style scoped lang="scss">
.time-slot-picker {
  background: $p-bg-card;
  border-radius: $p-radius-lg;
  padding: 24rpx;

  &__header {
    margin-bottom: 24rpx;
  }

  &__date-nav {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 32rpx;
  }

  &__arrow {
    font-size: 40rpx;
    color: $p-text-3;
    padding: 8rpx 20rpx;
    cursor: pointer;

    &:active {
      color: $p-primary;
    }
  }

  &__date {
    font-size: 30rpx;
    font-weight: 600;
    color: $p-text-1;
  }

  &__staff-scroll {
    margin-bottom: 24rpx;
    white-space: nowrap;
  }

  &__staff-list {
    display: inline-flex;
    gap: 20rpx;
    padding: 4rpx 0;
  }

  &__staff-item {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    padding: 16rpx 24rpx;
    border-radius: $p-radius;
    border: 2rpx solid $p-border-light;
    background: $p-bg-card;
    min-width: 140rpx;

    &.is-active {
      border-color: $p-primary;
      background: $p-primary-light;
    }
  }

  &__staff-avatar {
    width: 64rpx;
    height: 64rpx;
    border-radius: 50%;
    margin-bottom: 8rpx;
  }

  &__staff-name {
    font-size: 24rpx;
    color: $p-text-1;
    font-weight: 500;
  }

  &__staff-level {
    font-size: 20rpx;
    color: $p-text-3;
    margin-top: 4rpx;
  }

  &__slots {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
  }

  &__slot {
    padding: 16rpx 28rpx;
    border-radius: $p-radius;
    border: 2rpx solid $p-border-light;
    font-size: 26rpx;
    color: $p-text-2;
    background: $p-bg-card;

    &:active {
      border-color: $p-primary;
      color: $p-primary;
    }

    &.is-selected {
      border-color: $p-primary;
      background: $p-primary;
      color: #fff;
    }
  }

  &__empty {
    text-align: center;
    padding: 60rpx 0;
    font-size: 28rpx;
    color: $p-text-3;
  }
}
</style>
