import { Newtype, iso } from 'newtype-ts'

export const name = 'DateTime'
export interface DateTime
  extends Newtype<{ readonly [name]: unique symbol }, string> {}

// TODO: Date validation
export const isoDateTime = iso<DateTime>()

export const wrap = isoDateTime.wrap.bind(isoDateTime)
export const unwrap = isoDateTime.unwrap.bind(isoDateTime)

export default DateTime
