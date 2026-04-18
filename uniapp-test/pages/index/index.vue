<template>
  <view class="home">
    <view class="search-bar">
      <view class="search-input-wrap">
        <text class="search-icon">🔍</text>
        <input class="search-input" v-model="keyword" placeholder="搜索商品..." />
        <text class="search-btn" @click="search">搜索</text>
      </view>
    </view>

    <view class="category-tabs">
      <view 
        v-for="cat in categories" 
        :key="cat" 
        class="category-tab"
        :class="{ active: currentCategory === cat }"
        @click="setCategory(cat)"
      >{{ cat }}</view>
    </view>

    <view class="waterfall">
      <view class="goods-card" v-for="item in goodsList" :key="item.id" @click="goToDetail(item)">
        <image :src="getImageUrl(item.image_url)" mode="widthFix" class="card-img" lazy-load />
        <view class="card-info">
          <text class="title">{{ item.title }}</text>
          <text class="price">¥{{ item.price }}</text>
          <text class="time">{{ relativeTime(item.created_at) }}</text>
        </view>
      </view>
    </view>

    <view class="load-more" v-if="loading">
      <text class="loading-icon">⏳</text> 加载中...
    </view>
    <view class="load-more" v-else-if="noMore">没有更多了</view>

    <TabBar :current="0" />
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
import { useGoodsStore } from '@/stores/goods'
import TabBar from '@/components/TabBar.vue'
import { API_BASE_URL, getImageUrl } from '@/utils/api'

const goodsList = ref<any[]>([])
const page = ref(1)
const loading = ref(false)
const noMore = ref(false)
const keyword = ref('')
const currentCategory = ref('全部')
const categories = ['全部', '图书教材', '数码产品', '生活用品', '其他']

const goodsStore = reactive({
  keyword: '',
  category: '',
  sort: 'created_at_desc'
})

const fetchGoods = async (isRefresh = false) => {
  if (loading.value || (noMore.value && !isRefresh)) return
  loading.value = true

  if (isRefresh) {
    page.value = 1
    noMore.value = false
  }

  try {
    const res = await uni.request({
      url: `${API_BASE_URL}/api/goods`,
      method: 'GET',
      data: {
        page: page.value,
        per_page: 10,
        keyword: keyword.value,
        category: currentCategory.value === '全部' ? '' : currentCategory.value,
        sort: goodsStore.sort
      },
      header: {
        'Authorization': `Bearer ${uni.getStorageSync('token') || ''}`
      }
    })

    if (res.statusCode === 200) {
      const data = (res.data as any).data
      if (isRefresh) {
        goodsList.value = data.items
      } else {
        goodsList.value.push(...data.items)
      }
      if (data.items.length < 10) {
        noMore.value = true
      }
      page.value++
    }
  } catch (error) {
    console.error('获取商品列表失败:', error)
  } finally {
    loading.value = false
    if (isRefresh) {
      uni.stopPullDownRefresh()
    }
  }
}

const setCategory = (cat: string) => {
  currentCategory.value = cat
  fetchGoods(true)
}

const search = () => {
  goodsStore.keyword = keyword.value
  fetchGoods(true)
}

const goToDetail = (item: any) => {
  uni.navigateTo({
    url: `/pages/detail/detail?id=${item.id}`
  })
}

const relativeTime = (isoStr: string) => {
  const diff = Date.now() - new Date(isoStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins}分钟前`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}小时前`
  return `${Math.floor(hours / 24)}天前`
}



onLoad(() => {
  fetchGoods()
})

onPullDownRefresh(() => {
  fetchGoods(true)
})

onReachBottom(() => {
  fetchGoods()
})
</script>

<style lang="scss" scoped>
.home {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding-bottom: 120rpx;
}

.search-bar {
  padding: 20rpx;
  background: #fff;
}

.search-input-wrap {
  display: flex;
  align-items: center;
  background: #f5f7fa;
  border-radius: 40rpx;
  padding: 0 20rpx;
}

.search-icon {
  font-size: 28rpx;
  margin-right: 16rpx;
}

.search-input {
  flex: 1;
  height: 72rpx;
  font-size: 28rpx;
}

.search-btn {
  color: #667eea;
  font-size: 28rpx;
  padding: 0 20rpx;
}

.category-tabs {
  display: flex;
  padding: 20rpx;
  background: #fff;
  overflow-x: auto;
  white-space: nowrap;
  border-bottom: 1rpx solid #f0f0f0;
}

.category-tab {
  padding: 12rpx 24rpx;
  border-radius: 24rpx;
  font-size: 26rpx;
  margin-right: 16rpx;
  background: #f5f7fa;
  color: #606266;

  &.active {
    background: #667eea;
    color: #fff;
  }
}

.waterfall {
  column-count: 2;
  column-gap: 16rpx;
  padding: 20rpx;
}

.goods-card {
  break-inside: avoid;
  background: #fff;
  margin-bottom: 20rpx;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.card-img {
  width: 100%;
  display: block;
}

.card-info {
  padding: 16rpx;
}

.title {
  font-size: 26rpx;
  font-weight: bold;
  color: #303133;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.price {
  color: #f56c6c;
  font-size: 32rpx;
  font-weight: bold;
  display: block;
  margin-top: 8rpx;
}

.time {
  font-size: 22rpx;
  color: #909399;
  display: block;
  margin-top: 8rpx;
  text-align: right;
}

.load-more {
  text-align: center;
  color: #909399;
  padding: 30rpx 0;
  font-size: 26rpx;
}

.loading-icon {
  margin-right: 10rpx;
}
</style>
