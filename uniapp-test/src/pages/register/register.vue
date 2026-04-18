<template>
  <view class="register-container">
    <view class="logo">
      <text class="logo-icon">🎓</text>
      <text class="logo-text">校园二手交易</text>
    </view>

    <view class="register-card">
      <view class="form-item">
        <text class="label">用户名</text>
        <input 
          v-model="form.username" 
          placeholder="5-30个字符" 
          class="form-input"
        />
      </view>

      <view class="form-item">
        <text class="label">昵称</text>
        <input 
          v-model="form.nickname" 
          placeholder="展示给他人的称呼" 
          class="form-input"
        />
      </view>

      <view class="form-item">
        <text class="label">密码</text>
        <input 
          v-model="form.password" 
          type="password" 
          placeholder="6-20个字符" 
          class="form-input"
        />
      </view>

      <view class="form-item">
        <text class="label">确认密码</text>
        <input 
          v-model="form.confirmPassword" 
          type="password" 
          placeholder="请再次输入密码" 
          class="form-input"
        />
      </view>

      <view class="register-btn" :class="{ disabled: !canRegister }" @click="handleRegister">
        注册
      </view>

      <view class="login-link" @click="goToLogin">
        已有账号？去登录
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import { API_BASE_URL } from '@/utils/api'

const form = reactive({
  username: '',
  nickname: '',
  password: '',
  confirmPassword: ''
})

const canRegister = computed(() => {
  return form.username.length >= 5 && 
         form.nickname && 
         form.password.length >= 6 && 
         form.password === form.confirmPassword
})

const handleRegister = () => {
  if (!canRegister.value) {
    if (form.password !== form.confirmPassword) {
      uni.showToast({ title: '两次密码不一致', icon: 'none' })
    } else {
      uni.showToast({ title: '请填写完整信息', icon: 'none' })
    }
    return
  }

  uni.showLoading({ title: '注册中...' })

  uni.request({
    url: `${API_BASE_URL}/api/auth/register`,
    method: 'POST',
    data: {
      username: form.username,
      nickname: form.nickname,
      password: form.password
    },
    success: (res) => {
      if (res.statusCode === 201) {
        uni.showToast({ title: '注册成功', icon: 'success' })
        setTimeout(() => {
          uni.navigateTo({ url: '/pages/login/login' })
        }, 1500)
      } else {
        const errMsg = (res.data as any)?.message || '注册失败'
        uni.showToast({ title: errMsg, icon: 'none' })
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

const goToLogin = () => {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.register-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 40rpx;
}

.logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 60rpx;
}

.logo-icon {
  font-size: 100rpx;
  margin-bottom: 20rpx;
}

.logo-text {
  font-size: 40rpx;
  font-weight: bold;
  color: #fff;
}

.register-card {
  width: 100%;
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx;
}

.form-item {
  margin-bottom: 32rpx;
}

.label {
  font-size: 26rpx;
  color: #303133;
  font-weight: bold;
  margin-bottom: 12rpx;
  display: block;
}

.form-input {
  width: 100%;
  height: 80rpx;
  background: #f5f7fa;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
}

.register-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 28rpx;

  &.disabled {
    opacity: 0.5;
  }
}

.login-link {
  text-align: center;
  font-size: 26rpx;
  color: #667eea;
}
</style>
