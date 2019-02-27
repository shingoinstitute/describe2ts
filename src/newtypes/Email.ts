import { Newtype, prism } from 'newtype-ts'
import { validate } from 'isemail'

export const name = 'Email'
export interface Email
  extends Newtype<{ readonly [name]: unique symbol }, string> {}

export const isEmail = (s: unknown): s is Email =>
  typeof s === 'string' && validate(s, { allowUnicode: true })

export const prismEmail = prism<Email>(isEmail)

export const coerce = (s: string): Email => {
  if (!isEmail(s)) throw new Error(`${s} is not a valid email`)
  return s
}

export const wrap = prismEmail.getOption.bind(prismEmail)
export const unwrap = prismEmail.reverseGet.bind(prismEmail)

export default Email
