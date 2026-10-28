<template>
  <view class="page">
    <!-- Category Tabs -->
    <scroll-view scroll-x class="tab-bar" :show-scrollbar="false" :scroll-left="tabScrollLeft">
      <view class="tab-bar__inner">
        <view
          class="tab-item"
          :class="{ 'tab-item--active': activeCategoryId === null }"
          @click="switchCategory(null)"
        >
          <text class="tab-item__text">全部</text>
        </view>
        <view
          class="tab-item"
          :class="{ 'tab-item--active': activeCategoryId === cat.id }"
          v-for="cat in categories"
          :key="cat.id"
          :id="'tab-' + cat.id"
          @click="switchCategory(cat.id)"
        >
          <text class="tab-item__text">{{ cat.name }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- Search Bar -->
    <view class="search-bar">
      <view class="search-bar__inner">
        <text class="search-bar__icon">&#x1F50D;</text>
        <input
          class="search-bar__input"
          v-model="keyword"
          placeholder="搜索服务名称"
          placeholder-class="search-bar__placeholder"
          confirm-type="search"
          @confirm="onSearch"
          @input="onSearchInput"
        />
        <view class="search-bar__clear" v-if="keyword" @click="clearSearch">
          <text class="search-bar__clear-icon">&#x2715;</text>
        </view>
      </view>
    </view>

    <!-- Service List -->
    <view class="service-list" v-if="serviceList.length">
      <ServiceCard
        v-for="item in serviceList"
        :key="item.id"
        :item="item"
        @click="goToDetail(item.id)"
      />
    </view>

    <!-- Loading More -->
    <view class="load-more" v-if="serviceList.length && loadingMore">
      <text class="load-more__text">加载中...</text>
    </view>

    <!-- No More -->
    <view class="load-more" v-if="serviceList.length && noMore && !loadingMore">
      <text class="load-more__text">没有更多了</text>
    </view>

    <!-- Empty State -->
    <EmptyState
      v-if="!loading && !serviceList.length"
      description="暂无相关服务"
    />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onShow, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
import { getCategoryList } from '@/api/category'
import { getServiceItemList } from '@/api/serviceItem'
import ServiceCard from '@/components/ServiceCard.vue'
import EmptyState from '@/components/EmptyState.vue'

const categories = ref([])
const activeCategoryId = ref(null)
const keyword = ref('')
const serviceList = ref([])
const loading = ref(false)
const loadingMore = ref(false)
const noMore = ref(false)
const page = ref(1)
const pageSize = 10
const tabScrollLeft = ref(0)

let searchTimer = null

async function loadCategories() {
  try {
    const data = await getCategoryList(1)
    categories.value = data || []
  } catch (e) {
    console.error('loadCategories error:', e)
  }
}

async function loadServiceList(reset = true) {
  if (reset) {
    page.value = 1
    noMore.value = false
    serviceList.value = []
  }

  if (noMore.value && !reset) return

  loading.value = true
  try {
    const params = {
      page: page.value,
      pageSize
    }
    if (activeCategoryId.value !== null) {
      params.categoryId = activeCategoryId.value
    }
    if (keyword.value.trim()) {
      params.name = keyword.value.trim()
    }

    const data = await getServiceItemList(params)
    const list = data || []

    if (reset) {
      serviceList.value = list
    } else {
      serviceList.value = [...serviceList.value, ...list]
    }

    if (list.length < pageSize) {
      noMore.value = true
    } else {
      page.value++
    }
  } catch (e) {
    console.error('loadServiceList error:', e)
    uni.showToast({ icon: 'none', title: '加载失败' })
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

function switchCategory(id) {
  if (activeCategoryId.value === id) return
  activeCategoryId.value = id
  loadServiceList(true)
}

function onSearch() {
  loadServiceList(true)
}

function onSearchInput() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    loadServiceList(true)
  }, 500)
}

function clearSearch() {
  keyword.value = ''
  loadServiceList(true)
}

function goToDetail(id) {
  uni.navigateTo({ url: `/pages/service/detail?id=${id}` })
}

// Listen for category switch from home page
function onSwitchCategoryHandler({ categoryId }) {
  if (categoryId) {
    activeCategoryId.value = categoryId
  }
}

onLoad((options) => {
  if (options?.categoryId) {
    activeCategoryId.value = Number(options.categoryId)
  }
  uni.showLoading({ title: '加载中...' })
  Promise.all([loadCategories(), loadServiceList(true)]).finally(() => {
    uni.hideLoading()
  })
})

onShow(() => {
  // Refresh when returning to this page (e.g., from detail)
})

uni.$on('switchCategory', onSwitchCategoryHandler)

onPullDownRefresh(async () => {
  await loadServiceList(true)
  uni.stopPullDownRefresh()
})

onReachBottom(() => {
  if (!noMore.value && !loadingMore.value) {
    loadingMore.value = true
    loadServiceList(false)
  }
})
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: $p-bg-page;
  display: flex;
  flex-direction: column;
}

/* Tab Bar */
.tab-bar {
  background: $p-bg-card;
  white-space: nowrap;
  flex-shrink: 0;
  border-bottom: 1rpx solid $p-border-light;

  &__inner {
    display: flex;
    padding: 20rpx 24rpx;
    gap: 16rpx;
  }
}

.tab-item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12rpx 32rpx;
  border-radius: $p-radius-round;
  background: $p-bg-page;
  flex-shrink: 0;
  transition: all 0.2s ease;

  &--active {
    background: $p-primary;
  }

  &__text {
    font-size: 26rpx;
    color: $p-text-2;
    white-space: nowrap;
  }

  &--active &__text {
    color: #ffffff;
    font-weight: 600;
  }
}

/* Search Bar */
.search-bar {
  background: $p-bg-card;
  padding: 16rpx 24rpx 24rpx;
  flex-shrink: 0;

  &__inner {
    display: flex;
    align-items: center;
    background: $p-bg-page;
    border-radius: $p-radius-round;
    padding: 0 24rpx;
    height: 72rpx;
  }

  &__icon {
    font-size: 28rpx;
    margin-right: 12rpx;
    flex-shrink: 0;
  }

  &__input {
    flex: 1;
    font-size: 28rpx;
    color: $p-text-1;
    height: 72rpx;
  }

  &__placeholder {
    color: $p-text-4;
    font-size: 28rpx;
  }

  &__clear {
    width: 40rpx;
    height: 40rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-left: 8rpx;
  }

  &__clear-icon {
    font-size: 24rpx;
    color: $p-text-3;
  }
}

/* Service List */
.service-list {
  flex: 1;
  padding: 20rpx 24rpx;
}

/* Load More */
.load-more {
  display: flex;
  justify-content: center;
  padding: 32rpx 0;

  &__text {
    font-size: 24rpx;
    color: $p-text-3;
  }
}
</style>
