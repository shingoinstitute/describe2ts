// tslint:disable-next-line:no-implicit-dependencies
import { FieldType, Field } from 'jsforce'
import { escapeString, joinUnion } from './util'

export type TypescriptPrimitive =
  | 'string'
  | 'number'
  | 'boolean'
  | 'null'
  | 'undefined'
  | 'symbol'
  | 'object'
  | 'unknown'

export const getPicklistType = (f: Field) => {
  const values = f.picklistValues
  if (!values || values.length < 1) return 'string'

  return joinUnion(
    values.reduce(
      (p, c) => {
        if (c.active) {
          p.push(`${escapeString(c.value)}`)
        }
        return p
      },
      [] as string[],
    ),
  )
}

export type TypeGetter = (f: Field, newtype?: boolean) => string
export type SF2TSTypeMap = { readonly [k in FieldType]: TypeGetter }

export const createGetter = (
  primitive: TypescriptPrimitive,
  newtypeName?: string,
  subname = 'default',
): TypeGetter =>
  newtypeName
    ? (_f: Field, newtype) =>
        newtype ? `import(${escapeString(newtypeName)}).${subname}` : primitive
    : () => primitive

const intfn: TypeGetter = createGetter(
  'number',
  'newtype-ts/lib/Integer',
  'Integer',
)
const stringfn: TypeGetter = createGetter('string')
const idfn: TypeGetter = createGetter('string', 'describe2ts/newtypes/SFId')
const urlfn: TypeGetter = createGetter('string', 'describe2ts/newtypes/Url')
const boolfn: TypeGetter = createGetter('boolean')
const datefn: TypeGetter = createGetter('string', 'describe2ts/newtypes/Date')
const datetimefn: TypeGetter = createGetter(
  'string',
  'describe2ts/newtypes/DateTime',
)
const timefn: TypeGetter = createGetter('string', 'describe2ts/newtypes/Time')
const emailfn: TypeGetter = createGetter('string', 'describe2ts/newtypes/Email')
// TODO: figure out compound fields
const locationfn: TypeGetter = createGetter('object')
const base64fn: TypeGetter = createGetter(
  'string',
  'describe2ts/newtypes/Base64',
)
const numberfn: TypeGetter = createGetter('number')
const anyfn: TypeGetter = createGetter('unknown')

export const fieldTypeToTsType: SF2TSTypeMap = {
  address: locationfn,
  anyType: anyfn,
  base64: base64fn,
  boolean: boolfn,
  combobox: stringfn,
  complexvalue: stringfn,
  currency: numberfn,
  date: datefn,
  datetime: datetimefn,
  double: numberfn,
  email: emailfn,
  encryptedstring: stringfn,
  id: idfn,
  reference: idfn,
  int: intfn,
  location: locationfn,
  multipicklist: stringfn,
  percent: numberfn,
  phone: stringfn,
  picklist: getPicklistType,
  string: stringfn,
  textarea: stringfn,
  time: timefn,
  url: urlfn,
}
