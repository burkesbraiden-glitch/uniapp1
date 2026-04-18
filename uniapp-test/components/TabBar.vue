<template>
  <view class="tab-bar">
    <view 
      class="tab-item" 
      :class="{ active: currentIndex === 0 }"
      @click="switchTab(0)"
    >
      <text class="tab-icon">🏠</text>
      <text class="tab-text">首页</text>
    </view>
    <view 
      class="tab-item publish"
      @click="switchTab(1)"
    >
      <text class="publish-icon">+</text>
    </view>
    <view 
      class="tab-item" 
      :class="{ active: currentIndex === 2 }"
      @click="switchTab(2)"
    >
      <text class="tab-icon">👤</text>
      <text class="tab-text">我的</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  current: number
}>()

const currentIndex = ref(props.current)

watch(() => props.current, (val) => {
  currentIndex.value = val
})

const switchTab = (index: number) => {
  if (currentIndex.value === index) return
  
  currentIndex.value = index
  
  if (index === 0) {
    uni.switchTab({ url: '/pages/index/index' })
  } else if (index === 1) {
    uni.navigateTo({ url: '/pages/publish/publish' })
  } else if (index === 2) {
    uni.switchTab({ url: '/pages/my/my' })
  }
}
</script>

<style lang="scss" scoped>
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-around;
  background: #fff;
  padding: 20rpx 0;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -2rpx 16rpx rgba(0, 0, 0, 0.06);
  z-index: 999;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  padding: 0 40rpx;

  &.active {
    .tab-icon, .tab-text {
      color: #667eea;
    }
  }
}

.tab-icon {
  font-size: 44rpx;
  color: #909399;
}

.tab-text {
  font-size: 24rpx;
  color: #909399;
}

.publish {
  width: 100rpx;
  height: 100rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -30rpx;
  box-shadow: 0 4rpx 16rpx rgba(102, 126, 234, 0.4);
}

.publish-icon {
  font-size: 48rpx;
  color: #fff;
  font-weight: bold;
}
</style>
