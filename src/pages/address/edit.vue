<template>
  <view class="page">
    <view class="form-card">
      <!-- Contact Name -->
      <view class="form-item">
        <text class="form-item__label">
          <text class="form-item__required">*</text>
          联系人
        </text>
        <input
          class="form-item__input"
          v-model="form.contactName"
          placeholder="请输入联系人姓名"
          maxlength="20"
        />
      </view>

      <!-- Contact Phone -->
      <view class="form-item">
        <text class="form-item__label">
          <text class="form-item__required">*</text>
          手机号
        </text>
        <input
          class="form-item__input"
          v-model="form.contactPhone"
          type="number"
          placeholder="请输入手机号"
          maxlength="11"
        />
      </view>

      <!-- Region Picker -->
      <view class="form-item form-item--picker">
        <text class="form-item__label">
          <text class="form-item__required">*</text>
          所在地区
        </text>
        <picker
          mode="region"
          :value="regionValue"
          @change="onRegionChange"
        >
          <view class="picker-value">
            <text :class="['picker-text', { 'is-placeholder': !regionDisplay }]">
              {{ regionDisplay || '请选择省/市/区' }}
            </text>
            <text class="picker-arrow">›</text>
          </view>
        </picker>
      </view>

      <!-- Detail Address -->
      <view class="form-item form-item--column">
        <text class="form-item__label">
          <text class="form-item__required">*</text>
          详细地址
        </text>
        <textarea
          class="detail-textarea"
          v-model="form.detail"
          placeholder="请输入详细地址"
          maxlength="200"
          :auto-height="true"
        />
        <text class="detail-count">{{ (form.detail || '').length }}/200</text>
      </view>

      <!-- Default Switch -->
      <view class="form-item">
        <text class="form-item__label">设为默认</text>
        <switch
          :checked="form.isDefault"
          color="#4080FF"
          @change="form.isDefault = $event.detail.value"
        />
      </view>
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
import { getAddressList, addAddress, updateAddress } from '@/api/address'

const form = reactive({
  id: null,
  province: '',
  city: '',
  district: '',
  detail: '',
  contactName: '',
  contactPhone: '',
  isDefault: false
})

const isEdit = ref(false)

const regionValue = computed(() => {
  if (form.province && form.city && form.district) {
    return [form.province, form.city, form.district]
  }
  return []
})

const regionDisplay = computed(() => {
  if (form.province && form.city && form.district) {
    return `${form.province} ${form.city} ${form.district}`
  }
  return ''
})

onLoad((options) => {
  if (options && options.id) {
    isEdit.value = true
    loadAddress(Number(options.id))
  }
})

async function loadAddress(id) {
  uni.showLoading({ title: '加载中...' })
  try {
    const list = await getAddressList()
    const addr = (list || []).find((a) => a.id === id)
    if (addr) {
      Object.keys(form).forEach((key) => {
        if (addr[key] !== undefined && addr[key] !== null) {
          form[key] = addr[key]
        }
      })
      uni.setNavigationBarTitle({ title: '编辑地址' })
    }
  } catch (e) {
    console.error('加载地址信息失败', e)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

function onRegionChange(e) {
  const val = e.detail.value
  form.province = val[0] || ''
  form.city = val[1] || ''
  form.district = val[2] || ''
}

function validate() {
  if (!form.contactName.trim()) {
    uni.showToast({ title: '请输入联系人姓名', icon: 'none' })
    return false
  }
  if (!form.contactPhone.trim()) {
    uni.showToast({ title: '请输入手机号', icon: 'none' })
    return false
  }
  if (!/^1[3-9]\d{9}$/.test(form.contactPhone)) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return false
  }
  if (!form.province || !form.city || !form.district) {
    uni.showToast({ title: '请选择所在地区', icon: 'none' })
    return false
  }
  if (!form.detail.trim()) {
    uni.showToast({ title: '请输入详细地址', icon: 'none' })
    return false
  }
  return true
}

async function handleSave() {
  if (!validate()) return

  const data = {
    province: form.province,
    city: form.city,
    district: form.district,
    detail: form.detail.trim(),
    contactName: form.contactName.trim(),
    contactPhone: form.contactPhone,
    isDefault: form.isDefault
  }

  uni.showLoading({ title: '保存中...' })
  try {
    if (isEdit.value) {
      data.id = form.id
      await updateAddress(data)
    } else {
      await addAddress(data)
    }
    uni.showToast({ title: '保存成功', icon: 'success' })
    setTimeout(() => {
      uni.navigateBack()
    }, 500)
  } catch (e) {
    console.error('保存地址失败', e)
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
  overflow: hidden;
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

  &--column {
    flex-direction: column;
    align-items: flex-start;
  }

  &__label {
    font-size: 28rpx;
    color: $p-text-1;
    flex-shrink: 0;
    min-width: 160rpx;

    .form-item--column & {
      margin-bottom: 16rpx;
    }
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

/* ---- Detail Textarea ---- */
.detail-textarea {
  width: 100%;
  min-height: 120rpx;
  font-size: 28rpx;
  color: $p-text-1;
  padding: 16rpx;
  background: $p-bg-page;
  border-radius: $p-radius;
  box-sizing: border-box;
}

.detail-count {
  display: block;
  text-align: right;
  font-size: 22rpx;
  color: $p-text-4;
  margin-top: 8rpx;
  width: 100%;
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
