import { Newtype, prism } from 'newtype-ts'
import * as validUrl from 'valid-url'

// must match name of interface
export const name = 'Url'
export interface Url
  extends Newtype<{ readonly [name]: unique symbol }, string> {}

export const isValidUrl = (s: unknown): s is Url =>
  typeof s === 'string' && !!validUrl.isWebUri(s)

export const prismUrl = prism<Url>(isValidUrl)

export const coerce = (s: string): Url => {
  if (!isValidUrl(s)) throw new Error(`${s} is not a valid Url`)
  return s
}

export const wrap = prismUrl.getOption.bind(prismUrl)
export const unwrap = prismUrl.reverseGet.bind(prismUrl)

export default Url
