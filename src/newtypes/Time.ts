import { Newtype, iso } from 'newtype-ts'

export const name = 'Time'
export interface Time
  extends Newtype<{ readonly [name]: unique symbol }, string> {}

// TODO: Time validation
export const isoTime = iso<Time>()

export const wrap = isoTime.wrap.bind(isoTime)
export const unwrap = isoTime.unwrap.bind(isoTime)

export default Time
