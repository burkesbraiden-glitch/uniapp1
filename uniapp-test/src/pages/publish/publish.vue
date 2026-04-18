<template>
  <view class="publish-container">
    <view class="scan-btn" @click="handleScanOrInput">
      <text class="icon">📷</text>
      <text class="btn-text">{{ isH5() ? '手动输入ISBN' : '扫码识别图书 (ISBN)' }}</text>
    </view>

    <view v-if="showISBNInput" class="isbn-input-modal">
      <view class="modal-mask" @click="showISBNInput = false"></view>
      <view class="modal-content">
        <text class="modal-title">输入ISBN编号</text>
        <input 
          v-model="isbnInput" 
          placeholder="请输入13位ISBN编号" 
          class="isbn-input"
        />
        <view class="modal-actions">
          <view class="modal-btn cancel" @click="showISBNInput = false">取消</view>
          <view class="modal-btn confirm" @click="queryBookInfo">查询</view>
        </view>
      </view>
    </view>

    <view class="form-card">
      <view class="form-item">
        <text class="label">商品标题</text>
        <input 
          v-model="form.title" 
          placeholder="扫码可自动填写，或手动输入" 
          class="form-input"
        />
      </view>

      <view class="form-item">
        <text class="label">商品描述</text>
        <textarea 
          v-model="form.description" 
          placeholder="商品描述，扫码可自动填充作者、出版社等信息" 
          class="form-textarea"
        />
      </view>

      <view class="form-item">
        <text class="label">价格 (元)</text>
        <view class="price-input-wrap">
          <text class="price-symbol">¥</text>
          <input 
            v-model="form.price" 
            type="digit" 
            placeholder="0.00" 
            class="price-input"
          />
        </view>
      </view>

      <view class="form-item">
        <text class="label">分类</text>
        <view class="category-options">
          <view 
            v-for="cat in categories" 
            :key="cat"
            class="category-option"
            :class="{ active: form.category === cat }"
            @click="form.category = cat"
          >{{ cat }}</view>
        </view>
      </view>

      <view class="form-item">
        <text class="label">商品图片</text>
        <view class="image-upload" @click="chooseAndCompressImage">
          <image v-if="form.imageUrl" :src="form.imageUrl" mode="aspectFill" class="uploaded-image" />
          <view v-else class="upload-placeholder">
            <text class="upload-icon">📷</text>
            <text class="upload-text">点击拍照/上传图片</text>
          </view>
        </view>
        <text class="tip">支持 jpg/png/webp，系统会自动压缩</text>
      </view>

      <view class="form-item">
        <text class="label">面交地点</text>
        <view class="location-box" @click="getLocation">
          <text class="location-icon">📍</text>
          <text class="location-text">{{ locationName || form.locationDesc || '点击获取当前位置' }}</text>
          <text class="location-arrow">›</text>
        </view>
      </view>

      <view v-if="showLocationInput" class="location-input-modal">
        <view class="modal-mask" @click="showLocationInput = false"></view>
        <view class="modal-content">
          <text class="modal-title">输入面交地点</text>
          <input 
            v-model="form.locationDesc" 
            placeholder="例如：图书馆门口、教学楼A栋" 
            class="location-input"
          />
          <view class="modal-actions">
            <view class="modal-btn cancel" @click="showLocationInput = false">取消</view>
            <view class="modal-btn confirm" @click="confirmLocation">确定</view>
          </view>
        </view>
      </view>

      <view class="submit-btn" :class="{ disabled: !canSubmit }" @click="submitPublish">
        确认发布
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { API_BASE_URL, isH5 } from '@/utils/api'

const form = reactive({
  title: '',
  description: '',
  price: '',
  category: '其他',
  imageUrl: '',
  latitude: null as number | null,
  longitude: null as number | null,
  locationDesc: ''
})

const locationName = ref('')
const categories = ['图书教材', '数码产品', '生活用品', '其他']
const showISBNInput = ref(false)
const isbnInput = ref('')
const showLocationInput = ref(false)

const canSubmit = computed(() => {
  return form.title && form.price && form.category && form.imageUrl
})

const handleScanOrInput = () => {
  if (isH5()) {
    showISBNInput.value = true
  } else {
    scanISBN()
  }
}

const scanISBN = () => {
  uni.scanCode({
    scanType: ['barCode'],
    success: (res) => {
      isbnInput.value = res.result
      queryBookInfo()
    },
    fail: () => {
      uni.showToast({ title: '扫码失败，请手动输入ISBN', icon: 'none' })
      showISBNInput.value = true
    }
  })
}

const queryBookInfo = () => {
  const isbn = isbnInput.value.trim()
  if (!isbn) {
    uni.showToast({ title: '请输入ISBN编号', icon: 'none' })
    return
  }
  
  showISBNInput.value = false
  uni.showLoading({ title: '查询图书信息...' })
  
  uni.request({
    url: `https://api.jike.xyz/situ/book/isbn/${isbn}`,
    success: (apiRes) => {
      const data = (apiRes.data as any)
      if (data && data.data) {
        const book = data.data
        form.title = book.name || book.title || '未知书名'
        form.description = `作者：${book.author || '未知'}\n出版社：${book.publishing || '未知'}\n原价：${book.price || '未知'}`
        form.category = '图书教材'
        uni.showToast({ title: '识别成功', icon: 'success' })
      } else {
        uni.showToast({ title: '未找到图书信息', icon: 'none' })
      }
    },
    fail: () => {
      uni.showToast({ title: '查询失败', icon: 'none' })
    },
    complete: () => {
      uni.hideLoading()
    }
  })
}

const chooseAndCompressImage = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      const tempFilePath = res.tempFilePaths[0]
      uni.showLoading({ title: '上传中...' })
      
      uni.uploadFile({
        url: `${API_BASE_URL}/api/upload`,
        filePath: tempFilePath,
        name: 'image',
        header: {
          'Authorization': `Bearer ${uni.getStorageSync('token') || ''}`
        },
        success: (uploadRes) => {
          try {
            const data = JSON.parse(uploadRes.data)
            if (data.url) {
              form.imageUrl = `${API_BASE_URL}${data.url}`
              uni.showToast({ title: '上传成功', icon: 'success' })
            } else {
              uni.showToast({ title: '上传失败', icon: 'none' })
            }
          } catch {
            uni.showToast({ title: '上传失败', icon: 'none' })
          }
        },
        fail: () => {
          uni.showToast({ title: '上传失败', icon: 'none' })
        },
        complete: () => {
          uni.hideLoading()
        }
      })
    }
  })
}

const getLocation = () => {
  if (isH5()) {
    uni.showModal({
      title: '提示',
      content: 'H5环境下定位功能可能受限，请手动输入面交地点',
      showCancel: false
    })
    setTimeout(() => {
      showLocationInput.value = true
    }, 500)
    return
  }
  
  uni.getLocation({
    type: 'gcj02',
    success: (res) => {
      form.latitude = res.latitude
      form.longitude = res.longitude
      locationName.value = '已获取当前位置'
      
      uni.showToast({ title: '位置获取成功', icon: 'success' })
    },
    fail: () => {
      uni.showToast({ title: '获取位置失败，请手动输入地址', icon: 'none' })
      showLocationInput.value = true
    }
  })
}

const confirmLocation = () => {
  showLocationInput.value = false
  if (form.locationDesc) {
    uni.showToast({ title: '地址已保存', icon: 'success' })
  }
}

const submitPublish = () => {
  if (!canSubmit.value) {
    uni.showToast({ title: '请填写完整信息', icon: 'none' })
    return
  }

  uni.showLoading({ title: '发布中...' })
  
  uni.request({
    url: `${API_BASE_URL}/api/goods`,
    method: 'POST',
    data: {
      title: form.title,
      description: form.description,
      price: parseFloat(form.price),
      category: form.category,
      contact: uni.getStorageSync('userInfo')?.contact || '请联系卖家',
      latitude: form.latitude,
      longitude: form.longitude
    },
    header: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${uni.getStorageSync('token') || ''}`
    },
    success: (res) => {
      if (res.statusCode === 201) {
        uni.showToast({ title: '发布成功', icon: 'success' })
        setTimeout(() => {
          uni.switchTab({ url: '/pages/index/index' })
        }, 1500)
      } else {
        uni.showToast({ title: '发布失败', icon: 'none' })
      }
    },
    fail: () => {
      uni.showToast({ title: '发布失败', icon: 'none' })
    },
    complete: () => {
      uni.hideLoading()
    }
  })
}
</script>

<style lang="scss" scoped>
.publish-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 20rpx;
  padding-bottom: 120rpx;
}

.scan-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  color: #2e7d32;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  border: 2rpx dashed #81c784;
}

.icon {
  font-size: 48rpx;
  margin-right: 16rpx;
}

.btn-text {
  font-size: 32rpx;
  font-weight: bold;
}

.form-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
}

.form-item {
  margin-bottom: 32rpx;
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
  height: 80rpx;
  background: #f5f7fa;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
}

.form-textarea {
  width: 100%;
  height: 160rpx;
  background: #f5f7fa;
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 28rpx;
}

.price-input-wrap {
  display: flex;
  align-items: center;
  background: #f5f7fa;
  border-radius: 12rpx;
  padding: 0 20rpx;
}

.price-symbol {
  font-size: 32rpx;
  color: #f56c6c;
  font-weight: bold;
}

.price-input {
  flex: 1;
  height: 80rpx;
  font-size: 32rpx;
}

.category-options {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.category-option {
  padding: 16rpx 32rpx;
  background: #f5f7fa;
  border-radius: 24rpx;
  font-size: 26rpx;
  color: #606266;

  &.active {
    background: #667eea;
    color: #fff;
  }
}

.image-upload {
  width: 200rpx;
  height: 200rpx;
  background: #f5f7fa;
  border-radius: 12rpx;
  overflow: hidden;
}

.uploaded-image {
  width: 100%;
  height: 100%;
}

.upload-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.upload-icon {
  font-size: 48rpx;
  margin-bottom: 8rpx;
}

.upload-text {
  font-size: 22rpx;
  color: #909399;
}

.tip {
  font-size: 22rpx;
  color: #909399;
  margin-top: 12rpx;
  display: block;
}

.location-box {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: #f5f7fa;
  border-radius: 12rpx;
}

.location-icon {
  font-size: 28rpx;
  margin-right: 12rpx;
}

.location-text {
  flex: 1;
  font-size: 28rpx;
  color: #303133;
}

.location-arrow {
  font-size: 32rpx;
  color: #909399;
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: bold;
  margin-top: 40rpx;

  &.disabled {
    opacity: 0.5;
  }
}

.isbn-input-modal,
.location-input-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: relative;
  width: 80%;
  background: #fff;
  border-radius: 24rpx;
  padding: 48rpx;
  z-index: 1001;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #303133;
  text-align: center;
  display: block;
  margin-bottom: 32rpx;
}

.isbn-input,
.location-input {
  width: 100%;
  height: 88rpx;
  background: #f5f7fa;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  margin-bottom: 32rpx;
}

.modal-actions {
  display: flex;
  gap: 24rpx;
}

.modal-btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  border-radius: 40rpx;
  font-size: 30rpx;
}

.modal-btn.cancel {
  background: #f5f7fa;
  color: #606266;
}

.modal-btn.confirm {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}
</style>
