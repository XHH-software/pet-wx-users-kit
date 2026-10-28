import dayjs from 'dayjs'

export function formatDate(date) {
  return dayjs(date).format('YYYY-MM-DD')
}

export function formatDateTime(dt) {
  return dayjs(dt).format('YYYY-MM-DD HH:mm:ss')
}

export function formatTime(time) {
  return dayjs(time, 'HH:mm:ss').format('HH:mm')
}

export function formatPrice(price) {
  return Number(price).toFixed(2)
}

export function formatPhone(phone) {
  if (!phone || phone.length !== 11) return phone
  return phone.slice(0, 3) + '****' + phone.slice(7)
}

export function isVaccineExpired(expiryDate) {
  if (!expiryDate) return false
  return dayjs(expiryDate).isBefore(dayjs(), 'day')
}

export function timeAgo(date) {
  const diff = dayjs().diff(dayjs(date), 'minute')
  if (diff < 1) return '刚刚'
  if (diff < 60) return `${diff}分钟前`
  if (diff < 1440) return `${Math.floor(diff / 60)}小时前`
  if (diff < 43200) return `${Math.floor(diff / 1440)}天前`
  return formatDate(date)
}
