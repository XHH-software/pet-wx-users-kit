<script>
export default {
  onLaunch() {
    console.log('App Launch')
  },
  onShow() {
    console.log('App Show')
  },
  onHide() {
    console.log('App Hide')
  }
}
</script>

<style lang="scss">
@import './uni.scss';

page {
  background: $p-bg-page;
  font-family: -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 28rpx;
  color: $p-text-1;
  box-sizing: border-box;
}

view, text, scroll-view, swiper {
  box-sizing: border-box;
}

image {
  display: block;
}

/* 通用工具类 */
.p-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.p-ellipsis-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.p-safe-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
