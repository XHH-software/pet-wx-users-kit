import request from '@/utils/request'

export function getCategoryList(type) {
  return request.get('/user/category/list', { type })
}
