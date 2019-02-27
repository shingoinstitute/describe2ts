import { Newtype, iso } from 'newtype-ts'

export const name = 'Date'
export interface Date
  extends Newtype<{ readonly [name]: unique symbol }, string> {}

// TODO: Date validation
export const isoDate = iso<Date>()

export const wrap = isoDate.wrap.bind(isoDate)
export const unwrap = isoDate.unwrap.bind(isoDate)

export default Date
