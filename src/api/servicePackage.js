import request from '@/utils/request'

export function getPackageList(params) {
  return request.get('/user/package/list', params)
}

export function getPackageDetail(id) {
  return request.get(`/user/package/${id}`)
}
