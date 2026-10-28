import request from '@/utils/request'

export function getServiceItemList(params) {
  return request.get('/user/service-item/list', params)
}

export function getServiceItemDetail(id) {
  return request.get(`/user/service-item/${id}`)
}
