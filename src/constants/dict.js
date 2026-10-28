import {
  APPOINTMENT_STATUS_OPTIONS,
  PAY_STATUS_OPTIONS,
  PET_SPECIES_OPTIONS,
  PET_SIZE_OPTIONS,
  GENDER_OPTIONS,
  STAFF_LEVEL_OPTIONS
} from './enums'

const DICT_MAP = {
  appointment: APPOINTMENT_STATUS_OPTIONS,
  pay: PAY_STATUS_OPTIONS,
  species: PET_SPECIES_OPTIONS,
  sizeLimit: PET_SIZE_OPTIONS,
  gender: GENDER_OPTIONS,
  staffLevel: STAFF_LEVEL_OPTIONS
}

export function getOptions(dictName) {
  return DICT_MAP[dictName] || []
}

export function getLabelByValue(dictName, value) {
  const options = getOptions(dictName)
  const item = options.find((o) => o.value === Number(value))
  return item ? item.label : '未知'
}

export function getColorByValue(dictName, value) {
  const options = getOptions(dictName)
  const item = options.find((o) => o.value === Number(value))
  return item ? item.color : '#86909C'
}
