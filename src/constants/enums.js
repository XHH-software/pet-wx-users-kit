export const APPOINTMENT_STATUS = {
  PENDING_PAY: 1,
  PENDING_SERVICE: 2,
  SERVING: 3,
  CANCELLED: 4,
  COMPLETED: 5,
  REVIEWED: 6
}

export const APPOINTMENT_STATUS_OPTIONS = [
  { value: 1, label: '待支付', color: '#FF7D00' },
  { value: 2, label: '待服务', color: '#4080FF' },
  { value: 3, label: '服务中', color: '#4080FF' },
  { value: 4, label: '已取消', color: '#86909C' },
  { value: 5, label: '已完成', color: '#00B42A' },
  { value: 6, label: '已评价', color: '#00B42A' }
]

export const PAY_STATUS = {
  UNPAID: 0,
  PAID: 1,
  REFUNDED: 2
}

export const PAY_STATUS_OPTIONS = [
  { value: 0, label: '未支付', color: '#FF7D00' },
  { value: 1, label: '已支付', color: '#00B42A' },
  { value: 2, label: '已退款', color: '#F53F3F' }
]

export const PET_SPECIES = {
  DOG: 1,
  CAT: 2,
  OTHER: 3
}

export const PET_SPECIES_OPTIONS = [
  { value: 1, label: '狗' },
  { value: 2, label: '猫' },
  { value: 3, label: '其他' }
]

export const PET_SIZE_LIMIT = {
  ALL: 0,
  SMALL: 1,
  MEDIUM: 2,
  LARGE: 3
}

export const PET_SIZE_OPTIONS = [
  { value: 0, label: '不限' },
  { value: 1, label: '小型' },
  { value: 2, label: '中型' },
  { value: 3, label: '大型' }
]

export const GENDER_OPTIONS = [
  { value: 1, label: '公' },
  { value: 2, label: '母' }
]

export const STAFF_LEVEL_OPTIONS = [
  { value: 1, label: '初级' },
  { value: 2, label: '中级' },
  { value: 3, label: '高级' }
]
