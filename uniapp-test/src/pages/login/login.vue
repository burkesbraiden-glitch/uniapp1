<template>
  <view class="login-container">
    <view class="logo">
      <text class="logo-icon">🎓</text>
      <text class="logo-text">校园二手交易</text>
    </view>

    <view class="login-card">
      <view class="form-item">
        <text class="label">用户名</text>
        <input 
          v-model="form.username" 
          placeholder="请输入用户名" 
          class="form-input"
        />
      </view>

      <view class="form-item">
        <text class="label">密码</text>
        <view class="password-input-wrap">
          <input 
            v-model="form.password" 
            :type="showPassword ? 'text' : 'password'" 
            placeholder="请输入密码" 
            class="form-input"
          />
          <text class="password-toggle" @click="showPassword = !showPassword">
            {{ showPassword ? '🙈' : '👁️' }}
          </text>
        </view>
      </view>

      <view class="login-btn" :class="{ disabled: !canLogin }" @click="handleLogin">
        登录
      </view>

      <view class="register-link" @click="goToRegister">
        还没有账号？去注册
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { API_BASE_URL } from '@/utils/api'

const form = reactive({
  username: '',
  password: ''
})

const showPassword = ref(false)

const canLogin = computed(() => {
  return form.username && form.password
})

const handleLogin = () => {
  if (!canLogin.value) {
    uni.showToast({ title: '请填写完整信息', icon: 'none' })
    return
  }

  uni.showLoading({ title: '登录中...' })

  uni.request({
    url: `${API_BASE_URL}/api/auth/login`,
    method: 'POST',
    data: {
      username: form.username,
      password: form.password
    },
    success: (res) => {
      if (res.statusCode === 200) {
        const data = (res.data as any).data
        uni.setStorageSync('token', data.token)
        uni.setStorageSync('userInfo', data.user)
        uni.showToast({ title: '登录成功', icon: 'success' })
        setTimeout(() => {
          uni.switchTab({ url: '/pages/index/index' })
        }, 1500)
      } else {
        uni.showToast({ title: '登录失败', icon: 'none' })
      }
    },
    fail: () => {
      uni.showToast({ title: '网络错误', icon: 'none' })
    },
    complete: () => {
      uni.hideLoading()
    }
  })
}

const goToRegister = () => {
  uni.navigateTo({ url: '/pages/register/register' })
}
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 40rpx;
}

.logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 80rpx;
}

.logo-icon {
  font-size: 120rpx;
  margin-bottom: 24rpx;
}

.logo-text {
  font-size: 48rpx;
  font-weight: bold;
  color: #fff;
}

.login-card {
  width: 100%;
  background: #fff;
  border-radius: 24rpx;
  padding: 48rpx;
}

.form-item {
  margin-bottom: 40rpx;
}

.label {
  font-size: 28rpx;
  color: #303133;
  font-weight: bold;
  margin-bottom: 16rpx;
  display: block;
}

.form-input {
  width: 100%;
  height: 88rpx;
  background: #f5f7fa;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 30rpx;
}

.password-input-wrap {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 24rpx;
  top: 50%;
  transform: translateY(-50%);
  font-size: 36rpx;
}

.login-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 32rpx;

  &.disabled {
    opacity: 0.5;
  }
}

.register-link {
  text-align: center;
  font-size: 28rpx;
  color: #667eea;
}
</style>
