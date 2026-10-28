// 本地联调：后端默认运行在 8080；小程序无 vite 代理，必须写完整地址
const BASE_URL = 'http://localhost:8080'

function getToken() {
  return uni.getStorageSync('token') || ''
}

function request(options) {
  return new Promise((resolve, reject) => {
    const token = getToken()
    const header = { ...options.header }
    if (token) {
      header['authentication'] = token
    }

    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data,
      header,
      success(res) {
        const { statusCode, data } = res
        if (statusCode === 200 && data) {
          if (data.code === 1) {
            resolve(data.data)
          } else if (data.code === 401) {
            uni.removeStorageSync('token')
            uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' })
            setTimeout(() => {
              uni.reLaunch({ url: '/pages/index/index' })
            }, 1500)
            reject(new Error('未授权'))
          } else {
            uni.showToast({ title: data.msg || '操作失败', icon: 'none' })
            reject(new Error(data.msg || '操作失败'))
          }
        } else {
          uni.showToast({ title: '网络异常，请稍后重试', icon: 'none' })
          reject(new Error('网络异常'))
        }
      },
      fail(err) {
        uni.showToast({ title: '网络连接失败', icon: 'none' })
        reject(err)
      }
    })
  })
}

export default {
  get(url, params) {
    return request({ url, method: 'GET', data: params })
  },
  post(url, data) {
    return request({ url, method: 'POST', data })
  },
  put(url, data) {
    return request({ url, method: 'PUT', data })
  },
  delete(url, data) {
    return request({ url, method: 'DELETE', data })
  }
}
