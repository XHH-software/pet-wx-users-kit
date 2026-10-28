import request from '@/utils/request'

export function getAvailableSlots(params) {
  return request.get('/user/schedule/available', params)
}

export function createAppointment(data) {
  return request.post('/user/appointment', data)
}

export function getAppointmentPage(params) {
  return request.get('/user/appointment/page', params)
}

export function getAppointmentDetail(id) {
  return request.get(`/user/appointment/${id}`)
}

export function payAppointment(id) {
  return request.post(`/user/appointment/${id}/pay`)
}

export function cancelAppointment(id, data) {
  return request.post(`/user/appointment/${id}/cancel`, data)
}
