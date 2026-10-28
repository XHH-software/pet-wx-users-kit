<template>
  <view class="page">
    <scroll-view
      class="scroll-area"
      scroll-y
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="loadMore"
    >
      <!-- Review Cards -->
      <view class="review-card" v-for="item in list" :key="item.id">
        <!-- Header: staff + date -->
        <view class="review-card__header">
          <text class="review-card__staff">{{ item.staffName }}</text>
          <text class="review-card__date">{{ timeAgo(item.createTime) }}</text>
        </view>

        <!-- Stars -->
        <view class="review-card__stars">
          <text
            v-for="i in 5"
            :key="i"
            :class="['star', { 'is-active': i <= item.score }]"
          >{{ i <= item.score ? '★' : '☆' }}</text>
        </view>

        <!-- Content -->
        <text class="review-card__content">{{ item.content }}</text>

        <!-- Images -->
        <view class="review-card__images" v-if="item.images && item.images.length">
          <image
            class="review-card__img"
            v-for="(img, idx) in item.images"
            :key="idx"
            :src="img"
            mode="aspectFill"
            @click="previewImage(item.images, idx)"
          />
        </view>

        <!-- Merchant Reply -->
        <view class="review-card__reply" v-if="item.replyContent">
          <text class="review-card__reply-label">商家回复</text>
          <text class="review-card__reply-text">{{ item.replyContent }}</text>
        </view>
      </view>

      <!-- Loading / No More -->
      <view class="list-footer" v-if="list.length > 0">
        <text class="list-footer__text" v-if="loading">加载中...</text>
        <text class="list-footer__text" v-else-if="noMore">没有更多了</text>
      </view>

      <!-- Empty State -->
      <EmptyState
        v-if="!loading && list.length === 0"
        description="暂无评价记录"
      />
    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getMyReviewList } from '@/api/review'
import { timeAgo } from '@/utils/format'
import EmptyState from '@/components/EmptyState.vue'

const list = ref([])
const page = ref(1)
const pageSize = 20
const total = ref(0)
const loading = ref(false)
const noMore = ref(false)
const refreshing = ref(false)

onShow(() => {
  refresh()
})

async function refresh() {
  page.value = 1
  noMore.value = false
  refreshing.value = true
  await fetchList(true)
  refreshing.value = false
}

async function onRefresh() {
  await refresh()
}

async function loadMore() {
  if (loading.value || noMore.value) return
  page.value++
  await fetchList(false)
}

async function fetchList(reset = false) {
  loading.value = true
  try {
    const res = await getMyReviewList({ page: page.value, pageSize })
    const records = res.records || []
    if (reset) {
      list.value = records
    } else {
      list.value = [...list.value, ...records]
    }
    total.value = res.total || 0
    if (list.value.length >= total.value) {
      noMore.value = true
    }
  } catch (e) {
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function previewImage(images, index) {
  uni.previewImage({ urls: images, current: images[index] })
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: $p-bg-page;
}

.scroll-area {
  height: 100vh;
  padding: 24rpx;
  box-sizing: border-box;
}

.review-card {
  background: $p-bg-card;
  border-radius: $p-radius-lg;
  padding: 28rpx;
  box-shadow: $p-shadow-card;
  margin-bottom: 24rpx;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16rpx;
  }

  &__staff {
    font-size: 30rpx;
    font-weight: 600;
    color: $p-text-1;
  }

  &__date {
    font-size: 24rpx;
    color: $p-text-3;
  }

  &__stars {
    display: flex;
    align-items: center;
    gap: 8rpx;
    margin-bottom: 16rpx;
  }

  &__content {
    font-size: 28rpx;
    color: $p-text-2;
    line-height: 1.7;
    display: block;
    margin-bottom: 16rpx;
  }

  &__images {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
    margin-bottom: 16rpx;
  }

  &__img {
    width: 160rpx;
    height: 160rpx;
    border-radius: $p-radius;
  }

  &__reply {
    background: $p-primary-light;
    border-radius: $p-radius;
    padding: 20rpx;
    margin-top: 8rpx;
  }

  &__reply-label {
    font-size: 24rpx;
    font-weight: 600;
    color: $p-primary;
    display: block;
    margin-bottom: 8rpx;
  }

  &__reply-text {
    font-size: 26rpx;
    color: $p-text-2;
    line-height: 1.6;
    display: block;
  }
}

.star {
  font-size: 32rpx;
  color: $p-text-4;
  line-height: 1;

  &.is-active {
    color: #FFC000;
  }
}

.list-footer {
  display: flex;
  justify-content: center;
  padding: 32rpx 0;

  &__text {
    font-size: 24rpx;
    color: $p-text-4;
  }
}
</style>
