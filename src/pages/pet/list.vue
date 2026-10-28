<template>
  <view class="page">
    <!-- Header -->
    <view class="page-header">
      <text class="page-header__title">我的宠物</text>
      <view class="page-header__add-btn" @click="goAdd">
        <text class="page-header__add-text">+ 添加宠物</text>
      </view>
    </view>

    <!-- Pet List -->
    <scroll-view
      v-if="petList.length > 0"
      class="pet-list"
      scroll-y
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onPullDownRefresh"
    >
      <view
        v-for="pet in petList"
        :key="pet.id"
        class="pet-item"
        @click="goEdit(pet.id)"
        @longpress="handleDelete(pet)"
      >
        <PetCard :pet="pet" :show-arrow="true" />
      </view>
    </scroll-view>

    <!-- Empty State -->
    <EmptyState
      v-else-if="!loading"
      description="还没有添加宠物"
    >
      <view class="empty-action" @click="goAdd">
        <text class="empty-action__text">去添加宠物</text>
      </view>
    </EmptyState>

    <!-- Loading -->
    <view v-if="loading && petList.length === 0" class="loading-wrap">
      <text class="loading-text">加载中...</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getPetList, deletePet } from '@/api/pet'
import PetCard from '@/components/PetCard.vue'
import EmptyState from '@/components/EmptyState.vue'

const petList = ref([])
const loading = ref(false)
const refreshing = ref(false)

async function fetchList() {
  loading.value = true
  try {
    const data = await getPetList()
    petList.value = data || []
  } catch (e) {
    console.error('获取宠物列表失败', e)
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
  uni.navigateTo({ url: '/pages/pet/edit' })
}

function goEdit(id) {
  uni.navigateTo({ url: `/pages/pet/edit?id=${id}` })
}

function handleDelete(pet) {
  uni.showModal({
    title: '确认删除',
    content: `确定要删除宠物「${pet.name}」吗？`,
    success: async (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '删除中...' })
        try {
          await deletePet(pet.id)
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
  padding-bottom: 40rpx;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;

  &__title {
    font-size: 36rpx;
    font-weight: 700;
    color: $p-text-1;
  }

  &__add-btn {
    background: $p-primary;
    padding: 12rpx 28rpx;
    border-radius: $p-radius-round;
  }

  &__add-text {
    font-size: 26rpx;
    color: #FFFFFF;
    font-weight: 500;
  }
}

.pet-list {
  height: auto;
}

.pet-item {
  margin-bottom: 4rpx;
}

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
