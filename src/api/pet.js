import request from '@/utils/request'

export function getPetList() {
  return request.get('/user/pet/list')
}

export function addPet(data) {
  return request.post('/user/pet', data)
}

export function updatePet(data) {
  return request.put('/user/pet', data)
}

export function deletePet(id) {
  return request.delete(`/user/pet/${id}`)
}
