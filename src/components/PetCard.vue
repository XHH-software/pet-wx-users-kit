<template>
  <view class="pet-card" @click="$emit('click')">
    <image class="pet-card__avatar" :src="pet.avatar || '/static/images/pet-default.png'" mode="aspectFill" />
    <view class="pet-card__info">
      <view class="pet-card__header">
        <text class="pet-card__name">{{ pet.name }}</text>
        <text class="pet-card__species">{{ speciesLabel }}</text>
        <text class="pet-card__gender">{{ genderLabel }}</text>
      </view>
      <view class="pet-card__meta">
        <text v-if="pet.breed">{{ pet.breed }}</text>
        <text v-if="pet.weight">{{ pet.weight }}kg</text>
      </view>
      <view class="pet-card__vaccine" v-if="showVaccine">
        <text :class="['pet-card__vaccine-tag', { 'is-expired': vaccineExpired }]">
          {{ vaccineExpired ? '疫苗已过期' : '疫苗至 ' + pet.vaccineExpiryDate }}
        </text>
      </view>
    </view>
    <view class="pet-card__arrow" v-if="showArrow">
      <text class="pet-card__arrow-icon">›</text>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { getLabelByValue } from '@/constants/dict'
import { isVaccineExpired } from '@/utils/format'

const props = defineProps({
  pet: { type: Object, required: true },
  showVaccine: { type: Boolean, default: true },
  showArrow: { type: Boolean, default: false }
})

defineEmits(['click'])

const speciesLabel = computed(() => getLabelByValue('species', props.pet.species))
const genderLabel = computed(() => getLabelByValue('gender', props.pet.gender))
const vaccineExpired = computed(() => isVaccineExpired(props.pet.vaccineExpiryDate))
</script>

<style scoped lang="scss">
.pet-card {
  display: flex;
  align-items: center;
  background: $p-bg-card;
  border-radius: $p-radius-lg;
  padding: 24rpx;
  box-shadow: $p-shadow-card;
  margin-bottom: 16rpx;

  &__avatar {
    width: 100rpx;
    height: 100rpx;
    border-radius: 50%;
    flex-shrink: 0;
    background: $p-bg-page;
  }

  &__info {
    flex: 1;
    margin-left: 20rpx;
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 12rpx;
  }

  &__name {
    font-size: 30rpx;
    font-weight: 600;
    color: $p-text-1;
  }

  &__species,
  &__gender {
    font-size: 22rpx;
    color: $p-text-3;
    background: $p-bg-page;
    padding: 2rpx 10rpx;
    border-radius: $p-radius-sm;
  }

  &__meta {
    display: flex;
    gap: 16rpx;
    margin-top: 8rpx;
    font-size: 24rpx;
    color: $p-text-2;
  }

  &__vaccine {
    margin-top: 8rpx;
  }

  &__vaccine-tag {
    font-size: 22rpx;
    color: $p-success;
    background: rgba(0, 180, 42, 0.1);
    padding: 2rpx 12rpx;
    border-radius: $p-radius-sm;

    &.is-expired {
      color: $p-danger;
      background: rgba(245, 63, 63, 0.1);
    }
  }

  &__arrow {
    flex-shrink: 0;
    margin-left: 12rpx;
  }

  &__arrow-icon {
    font-size: 36rpx;
    color: $p-text-4;
  }
}
</style>
