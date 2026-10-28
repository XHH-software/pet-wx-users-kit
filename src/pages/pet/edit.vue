<template>
  <view class="page">
    <!-- Avatar -->
    <view class="form-card avatar-card" @click="chooseAvatar">
      <text class="form-card__label">头像</text>
      <view class="avatar-wrap">
        <image
          class="avatar-img"
          :src="form.avatar || '/static/images/pet-default.png'"
          mode="aspectFill"
        />
        <text class="avatar-tip">点击更换</text>
      </view>
    </view>

    <!-- Basic Info -->
    <view class="form-card">
      <view class="form-item">
        <text class="form-item__label">
          <text class="form-item__required">*</text>
          名字
        </text>
        <input
          class="form-item__input"
          v-model="form.name"
          placeholder="请输入宠物名字"
          maxlength="32"
        />
      </view>

      <view class="form-item form-item--picker">
        <text class="form-item__label">
          <text class="form-item__required">*</text>
          种类
        </text>
        <picker
          mode="selector"
          :range="speciesOptions"
          range-key="label"
          :value="speciesIndex"
          @change="onSpeciesChange"
        >
          <view class="picker-value">
            <text :class="['picker-text', { 'is-placeholder': !form.species }]">
              {{ form.species ? speciesLabel : '请选择种类' }}
            </text>
            <text class="picker-arrow">›</text>
          </view>
        </picker>
      </view>

      <view class="form-item">
        <text class="form-item__label">品种</text>
        <input
          class="form-item__input"
          v-model="form.breed"
          placeholder="请输入品种"
          maxlength="32"
        />
      </view>

      <view class="form-item">
        <text class="form-item__label">性别</text>
        <view class="radio-group">
          <view
            v-for="item in genderOptions"
            :key="item.value"
            :class="['radio-item', { 'is-active': form.gender === item.value }]"
            @click="form.gender = item.value"
          >
            <text class="radio-item__text">{{ item.label }}</text>
          </view>
        </view>
      </view>

      <view class="form-item">
        <text class="form-item__label">体重(kg)</text>
        <input
          class="form-item__input"
          v-model="form.weight"
          type="digit"
          placeholder="请输入体重"
          @input="onWeightInput"
        />
      </view>

      <view class="form-item form-item--picker">
        <text class="form-item__label">生日</text>
        <picker
          mode="date"
          :value="form.birthday"
          start="2000-01-01"
          :end="today"
          @change="onBirthdayChange"
        >
          <view class="picker-value">
            <text :class="['picker-text', { 'is-placeholder': !form.birthday }]">
              {{ form.birthday || '请选择生日' }}
            </text>
            <text class="picker-arrow">›</text>
          </view>
        </picker>
      </view>
    </view>

    <!-- Health Info -->
    <view class="form-card">
      <view class="form-item">
        <text class="form-item__label">绝育状态</text>
        <switch
          :checked="form.neutered"
          color="#4080FF"
          @change="form.neutered = $event.detail.value"
        />
      </view>

      <view class="form-item form-item--picker">
        <text class="form-item__label">疫苗到期日</text>
        <picker
          mode="date"
          :value="form.vaccineExpiryDate"
          start="2020-01-01"
          :end="endYear"
          @change="onVaccineDateChange"
        >
          <view class="picker-value">
            <text :class="['picker-text', { 'is-placeholder': !form.vaccineExpiryDate }]">
              {{ form.vaccineExpiryDate || '请选择疫苗到期日' }}
            </text>
            <text class="picker-arrow">›</text>
          </view>
        </picker>
      </view>

      <view class="form-item">
        <text class="form-item__label">过敏信息</text>
        <input
          class="form-item__input"
          v-model="form.allergies"
          placeholder="请输入过敏信息"
          maxlength="200"
        />
      </view>
    </view>

    <!-- Remark -->
    <view class="form-card remark-card">
      <text class="form-card__label">备注</text>
      <textarea
        class="remark-textarea"
        v-model="form.remark"
        placeholder="请输入备注信息"
        maxlength="500"
        :auto-height="true"
      />
      <text class="remark-count">{{ (form.remark || '').length }}/500</text>
    </view>

    <!-- Save Button -->
    <view class="bottom-bar">
      <view class="save-btn" @click="handleSave">
        <text class="save-btn__text">保存</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getPetList, addPet, updatePet } from '@/api/pet'
import { PET_SPECIES_OPTIONS, GENDER_OPTIONS } from '@/constants/enums'
import dayjs from 'dayjs'

const speciesOptions = PET_SPECIES_OPTIONS
const genderOptions = GENDER_OPTIONS

const today = computed(() => dayjs().format('YYYY-MM-DD'))
const endYear = computed(() => dayjs().add(10, 'year').format('YYYY-MM-DD'))

const speciesIndex = computed(() => {
  const idx = speciesOptions.findIndex((o) => o.value === form.species)
  return idx >= 0 ? idx : 0
})

const speciesLabel = computed(() => {
  const item = speciesOptions.find((o) => o.value === form.species)
  return item ? item.label : ''
})

const form = reactive({
  id: null,
  avatar: '',
  name: '',
  species: null,
  breed: '',
  gender: 1,
  weight: '',
  birthday: '',
  neutered: false,
  vaccineExpiryDate: '',
  allergies: '',
  remark: ''
})

const isEdit = ref(false)

onLoad((options) => {
  if (options && options.id) {
    isEdit.value = true
    loadPet(Number(options.id))
  }
})

async function loadPet(id) {
  uni.showLoading({ title: '加载中...' })
  try {
    const list = await getPetList()
    const pet = (list || []).find((p) => p.id === id)
    if (pet) {
      Object.keys(form).forEach((key) => {
        if (pet[key] !== undefined && pet[key] !== null) {
          form[key] = pet[key]
        }
      })
      // Ensure weight is string for input binding
      form.weight = pet.weight != null ? String(pet.weight) : ''
      uni.setNavigationBarTitle({ title: '编辑宠物' })
    }
  } catch (e) {
    console.error('加载宠物信息失败', e)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

function chooseAvatar() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      form.avatar = res.tempFilePaths[0]
    }
  })
}

function onSpeciesChange(e) {
  const idx = Number(e.detail.value)
  form.species = speciesOptions[idx].value
}

function onBirthdayChange(e) {
  form.birthday = e.detail.value
}

function onVaccineDateChange(e) {
  form.vaccineExpiryDate = e.detail.value
}

function onWeightInput(e) {
  let val = e.detail.value
  // Allow only valid decimal numbers up to 100
  if (val !== '' && (isNaN(Number(val)) || Number(val) < 0 || Number(val) > 100)) {
    form.weight = val.slice(0, -1)
  }
}

function validate() {
  if (!form.name.trim()) {
    uni.showToast({ title: '请输入宠物名字', icon: 'none' })
    return false
  }
  if (!form.species) {
    uni.showToast({ title: '请选择种类', icon: 'none' })
    return false
  }
  if (form.weight !== '' && form.weight !== undefined) {
    const w = Number(form.weight)
    if (isNaN(w) || w <= 0) {
      uni.showToast({ title: '体重必须为正数', icon: 'none' })
      return false
    }
  }
  return true
}

async function handleSave() {
  if (!validate()) return

  const data = {
    avatar: form.avatar,
    name: form.name.trim(),
    species: form.species,
    breed: form.breed.trim(),
    gender: form.gender,
    weight: form.weight !== '' ? Number(form.weight) : null,
    birthday: form.birthday || null,
    neutered: form.neutered,
    vaccineExpiryDate: form.vaccineExpiryDate || null,
    allergies: form.allergies.trim(),
    remark: form.remark.trim()
  }

  uni.showLoading({ title: '保存中...' })
  try {
    if (isEdit.value) {
      data.id = form.id
      await updatePet(data)
    } else {
      await addPet(data)
    }
    uni.showToast({ title: '保存成功', icon: 'success' })
    setTimeout(() => {
      uni.navigateBack()
    }, 500)
  } catch (e) {
    console.error('保存宠物信息失败', e)
    uni.showToast({ title: '保存失败', icon: 'none' })
  } finally {
    uni.hideLoading()
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

/* ---- Form Card ---- */
.form-card {
  background: $p-bg-card;
  border-radius: $p-radius-lg;
  box-shadow: $p-shadow-card;
  margin-bottom: 24rpx;
  overflow: hidden;

  &__label {
    font-size: 28rpx;
    font-weight: 600;
    color: $p-text-1;
    padding: 28rpx 28rpx 0;
  }
}

/* ---- Avatar ---- */
.avatar-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx;
}

.avatar-wrap {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.avatar-img {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: $p-bg-page;
}

.avatar-tip {
  font-size: 24rpx;
  color: $p-text-3;
}

/* ---- Form Item ---- */
.form-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx;
  border-bottom: 1rpx solid $p-border-light;

  &:last-child {
    border-bottom: none;
  }

  &--picker {
    cursor: pointer;
  }

  &__label {
    font-size: 28rpx;
    color: $p-text-1;
    flex-shrink: 0;
    min-width: 160rpx;
  }

  &__required {
    color: $p-danger;
    margin-right: 4rpx;
  }

  &__input {
    flex: 1;
    text-align: right;
    font-size: 28rpx;
    color: $p-text-1;
  }
}

/* ---- Radio Group ---- */
.radio-group {
  display: flex;
  gap: 16rpx;
}

.radio-item {
  padding: 10rpx 32rpx;
  border-radius: $p-radius-round;
  background: $p-bg-page;
  border: 2rpx solid transparent;

  &.is-active {
    background: $p-primary-light;
    border-color: $p-primary;
  }

  &__text {
    font-size: 26rpx;
    color: $p-text-2;

    .is-active & {
      color: $p-primary;
      font-weight: 500;
    }
  }
}

/* ---- Picker ---- */
.picker-value {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.picker-text {
  font-size: 28rpx;
  color: $p-text-1;

  &.is-placeholder {
    color: $p-text-4;
  }
}

.picker-arrow {
  font-size: 32rpx;
  color: $p-text-4;
}

/* ---- Remark ---- */
.remark-card {
  padding: 28rpx;
}

.remark-textarea {
  width: 100%;
  min-height: 160rpx;
  font-size: 28rpx;
  color: $p-text-1;
  margin-top: 16rpx;
  padding: 16rpx;
  background: $p-bg-page;
  border-radius: $p-radius;
  box-sizing: border-box;
}

.remark-count {
  display: block;
  text-align: right;
  font-size: 22rpx;
  color: $p-text-4;
  margin-top: 8rpx;
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

.save-btn {
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
</style>
