<template>
  <view class="detail">
    <view v-if="loading" class="loading">
      <text>加载中...</text>
    </view>

    <view v-else-if="goods" class="detail-content">
      <scroll-view scroll-y class="scroll-container">
        <image :src="getImageUrl(goods.image_url)" mode="widthFix" class="goods-image" />

        <view class="goods-info">
          <text class="title">{{ goods.title }}</text>
          <view class="meta">
            <text class="category">{{ goods.category }}</text>
            <text class="seller">{{ goods.seller_nickname }}</text>
          </view>
          <view class="price-section">
            <text class="price-label">价格</text>
            <text class="price">¥{{ goods.price }}</text>
          </view>
        </view>

        <view class="section">
          <text class="section-title">商品描述</text>
          <text class="description">{{ goods.description }}</text>
        </view>

        <view class="section" v-if="goods.latitude && goods.longitude">
          <view class="map-nav" @click="openMap">
            <view class="nav-left">
              <text class="nav-icon">🗺️</text>
              <view class="nav-info">
                <text class="nav-title">卖家位置 (面交点)</text>
                <text class="nav-distance" v-if="distance">{{ distance }}</text>
              </view>
            </view>
            <text class="nav-btn">去导航 ›</text>
          </view>
        </view>

        <view class="section" v-if="isLoggedIn">
          <text class="section-title">联系方式</text>
          <view class="contact-info">
            <text class="contact-icon">📞</text>
            <text class="contact-text">{{ goods.contact }}</text>
          </view>
        </view>

        <view class="section" v-else>
          <text class="section-title">联系方式</text>
          <view class="contact-guest">
            <text>登录后查看联系方式</text>
            <view class="login-btn" @click="goToLogin">立即登录</view>
          </view>
        </view>

        <view class="bottom-space"></view>
      </scroll-view>

      <view class="bottom-bar">
        <view class="action-btn" @click="toggleFavorite">
          <text class="action-icon">{{ isFavorited ? '❤️' : '🤍' }}</text>
          <text class="action-text">{{ isFavorited ? '已收藏' : '收藏' }}</text>
        </view>
        <view class="buy-btn" v-if="isLoggedIn" @click="handleBuy">我想要</view>
      </view>
    </view>

    <view v-else class="empty">
      <text>商品不存在或已下架</text>
      <view class="back-btn" @click="goBack">返回首页</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { API_BASE_URL, getImageUrl, isH5 } from '@/utils/api'

const goods = ref<any>(null)
const loading = ref(true)
const isFavorited = ref(false)
const distance = ref('')

const isLoggedIn = computed(() => {
  return !!uni.getStorageSync('token')
})



const openMap = () => {
  if (!goods.value.latitude || !goods.value.longitude) {
    uni.showToast({ title: '卖家未提供位置信息', icon: 'none' })
    return
  }

  if (isH5()) {
    uni.showModal({
      title: '提示',
      content: 'H5环境下地图导航功能有限，请在App或小程序中打开',
      showCancel: false
    })
    return
  }

  uni.openLocation({
    latitude: parseFloat(goods.value.latitude),
    longitude: parseFloat(goods.value.longitude),
    name: '面交地点',
    scale: 15,
    success: () => {
      console.log('打开地图成功')
    },
    fail: () => {
      uni.showToast({ title: '打开地图失败', icon: 'none' })
    }
  })
}

const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

const toggleFavorite = () => {
  if (!isLoggedIn.value) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }

  isFavorited.value = !isFavorited.value
  uni.showToast({ 
    title: isFavorited.value ? '收藏成功' : '取消收藏', 
    icon: 'success' 
  })
}

const handleBuy = () => {
  uni.showToast({ title: '已发送求购信息，请等待卖家回复', icon: 'success' })
}

const goToLogin = () => {
  uni.navigateTo({ url: '/pages/login/login' })
}

const goBack = () => {
  uni.switchTab({ url: '/pages/index/index' })
}

onLoad(async (options: any) => {
  const id = options?.id
  if (!id) {
    loading.value = false
    return
  }

  try {
    const res = await uni.request({
      url: `${API_BASE_URL}/api/goods/${id}`,
      header: {
        'Authorization': `Bearer ${uni.getStorageSync('token') || ''}`
      }
    })

    if (res.statusCode === 200) {
      goods.value = (res.data as any).data
      isFavorited.value = goods.value.is_favorited || false

      if (goods.value.latitude && goods.value.longitude) {
        if (isH5()) {
          distance.value = 'H5环境暂不支持距离计算'
        } else {
          uni.getLocation({
            type: 'gcj02',
            success: (locRes) => {
              const dist = calculateDistance(
                locRes.latitude,
                locRes.longitude,
                parseFloat(goods.value.latitude),
                parseFloat(goods.value.longitude)
              )
              distance.value = `距您约 ${dist.toFixed(2)} km`
            },
            fail: () => {
              distance.value = '无法获取您的位置'
            }
          })
        }
      }
    }
  } catch (error) {
    console.error('获取商品详情失败:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style lang="scss" scoped>
.detail {
  min-height: 100vh;
  background: #f5f7fa;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.scroll-container {
  height: calc(100vh - 120rpx);
}

.goods-image {
  width: 100%;
  background: #fff;
}

.goods-info {
  background: #fff;
  padding: 32rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #303133;
  display: block;
  margin-bottom: 20rpx;
}

.meta {
  display: flex;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.category {
  background: #e6f7ff;
  color: #1890ff;
  padding: 8rpx 20rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
}

.seller {
  font-size: 26rpx;
  color: #909399;
}

.price-section {
  background: #fff2f0;
  padding: 24rpx;
  border-radius: 12rpx;
}

.price-label {
  font-size: 26rpx;
  color: #909399;
}

.price {
  font-size: 48rpx;
  font-weight: bold;
  color: #f56c6c;
  margin-left: 16rpx;
}

.section {
  background: #fff;
  padding: 32rpx;
  margin-top: 20rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #303133;
  margin-bottom: 20rpx;
  display: block;
}

.description {
  font-size: 28rpx;
  color: #606266;
  line-height: 1.8;
  white-space: pre-wrap;
}

.map-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #e6f7ff;
  padding: 24rpx;
  border-radius: 12rpx;
}

.nav-left {
  display: flex;
  align-items: center;
}

.nav-icon {
  font-size: 36rpx;
  margin-right: 16rpx;
}

.nav-info {
  display: flex;
  flex-direction: column;
}

.nav-title {
  font-size: 28rpx;
  color: #303133;
}

.nav-distance {
  font-size: 24rpx;
  color: #667eea;
  margin-top: 4rpx;
}

.nav-btn {
  font-size: 28rpx;
  color: #667eea;
  font-weight: bold;
}

.contact-info {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.contact-icon {
  font-size: 32rpx;
}

.contact-text {
  font-size: 30rpx;
  color: #303133;
}

.contact-guest {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.contact-guest text {
  font-size: 28rpx;
  color: #909399;
}

.login-btn {
  background: #667eea;
  color: #fff;
  padding: 16rpx 32rpx;
  border-radius: 8rpx;
  font-size: 28rpx;
  width: fit-content;
}

.bottom-space {
  height: 140rpx;
}

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
  background: #fff;
  box-shadow: 0 -2rpx 16rpx rgba(0, 0, 0, 0.06);
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  padding: 0 32rpx;
}

.action-icon {
  font-size: 40rpx;
}

.action-text {
  font-size: 24rpx;
  color: #606266;
}

.buy-btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 40rpx;
  font-size: 30rpx;
  font-weight: bold;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  gap: 32rpx;
}

.empty text {
  font-size: 32rpx;
  color: #909399;
}

.back-btn {
  background: #667eea;
  color: #fff;
  padding: 20rpx 60rpx;
  border-radius: 40rpx;
  font-size: 30rpx;
}
</style>
