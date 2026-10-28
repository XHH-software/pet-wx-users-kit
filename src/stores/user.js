import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import request from '@/utils/request'

export const useUserStore = defineStore('user', () => {
  const token = ref(uni.getStorageSync('token') || '')
  const userInfo = ref(uni.getStorageSync('userInfo') ? JSON.parse(uni.getStorageSync('userInfo')) : null)

  const isLogin = computed(() => !!token.value)
  const nickname = computed(() => userInfo.value?.nickname || '未登录')
  const avatar = computed(() => userInfo.value?.avatar || '')

  function setToken(t) {
    token.value = t
    uni.setStorageSync('token', t)
  }

  function setUserInfo(info) {
    userInfo.value = info
    uni.setStorageSync('userInfo', JSON.stringify(info))
  }

  async function wxLogin() {
    return new Promise((resolve, reject) => {
      // H5 / 浏览器调试时 uni.login 会失败，退化为用固定 code 调后端开发登录接口
      const doLogin = (code) => {
        request.post('/user/login', { code: code || 'dev_mock_code' }).then((data) => {
          setToken(data.token)
          setUserInfo({
            id: data.id,
            nickname: data.nickname,
            avatar: data.avatar,
            phone: data.phone
          })
          resolve(data)
        }).catch(reject)
      }
      uni.login({
        provider: 'weixin',
        success(loginRes) {
          doLogin(loginRes.code)
        },
        fail() {
          doLogin('dev_mock_code')
        }
      })
    })
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    uni.removeStorageSync('token')
    uni.removeStorageSync('userInfo')
  }

  function checkLogin() {
    if (!token.value) {
      uni.showToast({ title: '请先登录', icon: 'none' })
      return false
    }
    return true
  }

  return {
    token,
    userInfo,
    isLogin,
    nickname,
    avatar,
    setToken,
    setUserInfo,
    wxLogin,
    logout,
    checkLogin
  }
})
