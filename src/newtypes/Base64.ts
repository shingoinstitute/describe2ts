import { Newtype, prism } from 'newtype-ts'

export const name = 'Base64'
export interface Base64
  extends Newtype<{ readonly [name]: unique symbol }, string> {}

// Validation for base64 taken from validator.js - Credit to chriso

const notBase64 = /[^A-Z0-9+\/=]/i

/**
 * Validates base64 strings in the RFC 4648 standard format
 * @param str a base64 string
 */
export const isBase64 = (str: unknown): str is Base64 => {
  if (typeof str !== 'string') return false

  const len = str.length
  // base64 strings must be non-empty, length must be multiple of 4, and must be composed of valid characters
  if (str.length === 0 || len % 4 !== 0 || notBase64.test(str)) return false

  // padding characters must either:
  // not be present
  // be the last character
  // or be the last two characters
  const firstPaddingChar = str.indexOf('=')
  return (
    firstPaddingChar === -1 ||
    firstPaddingChar === len - 1 ||
    (firstPaddingChar === len - 2 && str[len - 1] === '=')
  )
}

export const prismBase64 = prism<Base64>(isBase64)

export const coerce = (s: string): Base64 => {
  if (!isBase64(s)) throw new Error(`${s} is not a valid base64 string`)
  return s
}

export const wrap = prismBase64.getOption.bind(prismBase64)
export const unwrap = prismBase64.reverseGet.bind(prismBase64)

export default Base64
