import request from '@/utils/request'

export function wxLogin(code) {
  return request.post('/user/login', { code })
}

export function getUserInfo() {
  return request.get('/user/info')
}

export function updateUserInfo(data) {
  return request.put('/user/info', data)
}

export function getShopStatus() {
  return request.get('/user/shop/status')
}
