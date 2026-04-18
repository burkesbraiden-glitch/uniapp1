<template>
  <view class="my">
    <view v-if="isLoggedIn" class="user-header">
      <view class="avatar-wrap">
        <text class="avatar">👤</text>
      </view>
      <view class="user-info">
        <text class="username">{{ userInfo.nickname }}</text>
        <text class="user-id">ID: {{ userInfo.id }}</text>
      </view>
    </view>

    <view v-else class="guest-header">
      <view class="login-btn" @click="goToLogin">立即登录</view>
    </view>

    <view class="menu-list">
      <view class="menu-item" @click="goToMyGoods" v-if="isLoggedIn">
        <text class="menu-icon">📦</text>
        <text class="menu-text">我的发布</text>
        <text class="menu-arrow">›</text>
      </view>

      <view class="menu-item" @click="goToFavorites" v-if="isLoggedIn">
        <text class="menu-icon">❤️</text>
        <text class="menu-text">我的收藏</text>
        <text class="menu-arrow">›</text>
      </view>

      <view class="menu-item" @click="goToProfile" v-if="isLoggedIn">
        <text class="menu-icon">👤</text>
        <text class="menu-text">个人资料</text>
        <text class="menu-arrow">›</text>
      </view>

      <view class="menu-item" @click="goToLogin" v-if="!isLoggedIn">
        <text class="menu-icon">🔑</text>
        <text class="menu-text">登录/注册</text>
        <text class="menu-arrow">›</text>
      </view>

      <view class="menu-item" @click="handleLogout" v-if="isLoggedIn">
        <text class="menu-icon">🚪</text>
        <text class="menu-text">退出登录</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <view class="stats-card" v-if="isLoggedIn && stats">
      <view class="stat-item">
        <text class="stat-value">{{ stats.goods_count || 0 }}</text>
        <text class="stat-label">发布商品</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ stats.favorite_count || 0 }}</text>
        <text class="stat-label">收藏商品</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">0</text>
        <text class="stat-label">交易完成</text>
      </view>
    </view>

    <view class="about">
      <text class="version">校园二手交易 v1.0.0</text>
    </view>

    <TabBar :current="2" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import TabBar from '@/components/TabBar.vue'
import { API_BASE_URL } from '@/utils/api'

const userInfo = ref({
  id: '',
  nickname: '',
  username: ''
})

const stats = ref<any>(null)

const isLoggedIn = computed(() => {
  return !!uni.getStorageSync('token')
})

const loadUserInfo = async () => {
  const stored = uni.getStorageSync('userInfo')
  if (stored) {
    userInfo.value = stored
  }

  try {
    const res = await uni.request({
      url: `${API_BASE_URL}/api/user/profile`,
      header: {
        'Authorization': `Bearer ${uni.getStorageSync('token') || ''}`
      }
    })

    if (res.statusCode === 200) {
      const data = (res.data as any).data
      stats.value = data
      if (data.nickname) {
        userInfo.value.nickname = data.nickname
      }
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

const goToLogin = () => {
  uni.navigateTo({ url: '/pages/login/login' })
}

const goToMyGoods = () => {
  uni.showToast({ title: '我的发布功能开发中', icon: 'none' })
}

const goToFavorites = () => {
  uni.showToast({ title: '我的收藏功能开发中', icon: 'none' })
}

const goToProfile = () => {
  uni.showToast({ title: '个人资料功能开发中', icon: 'none' })
}

const handleLogout = () => {
  uni.showModal({
    title: '确认退出',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        uni.removeStorageSync('token')
        uni.removeStorageSync('userInfo')
        userInfo.value = { id: '', nickname: '', username: '' }
        stats.value = null
        uni.showToast({ title: '已退出登录', icon: 'success' })
      }
    }
  })
}

onMounted(() => {
  if (isLoggedIn.value) {
    loadUserInfo()
  }
})
</script>

<style lang="scss" scoped>
.my {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 120rpx;
}

.user-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60rpx 40rpx;
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.avatar-wrap {
  width: 120rpx;
  height: 120rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar {
  font-size: 60rpx;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.username {
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
}

.user-id {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 8rpx;
}

.guest-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 80rpx 40rpx;
  display: flex;
  justify-content: center;
}

.login-btn {
  background: #fff;
  color: #667eea;
  padding: 20rpx 60rpx;
  border-radius: 40rpx;
  font-size: 32rpx;
  font-weight: bold;
}

.menu-list {
  margin: 20rpx;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.menu-icon {
  font-size: 36rpx;
  margin-right: 20rpx;
}

.menu-text {
  flex: 1;
  font-size: 30rpx;
  color: #303133;
}

.menu-arrow {
  font-size: 32rpx;
  color: #909399;
}

.stats-card {
  display: flex;
  margin: 20rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 48rpx;
  font-weight: bold;
  color: #667eea;
}

.stat-label {
  font-size: 24rpx;
  color: #909399;
  margin-top: 8rpx;
}

.about {
  text-align: center;
  padding: 40rpx;
}

.version {
  font-size: 24rpx;
  color: #909399;
}
</style>
