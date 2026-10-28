import request from '@/utils/request'

export function getAddressList() {
  return request.get('/user/address/list')
}

export function addAddress(data) {
  return request.post('/user/address', data)
}

export function updateAddress(data) {
  return request.put('/user/address', data)
}

export function deleteAddress(id) {
  return request.delete(`/user/address/${id}`)
}
