import request from '@/utils/request'

export function submitReview(data) {
  return request.post('/user/review', data)
}

export function getMyReviewList(params) {
  return request.get('/user/review/list', params)
}
