// tslint:disable-next-line: no-implicit-dependencies
import { Field, ChildRelationship, DescribeSObjectResult } from 'jsforce'
import { SF2TSTypeMap } from './sf-type'
import { escapeString, joinUnion } from './util'
import { Option, fromNullable, none, some } from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/function'

const createKvType = (
  name: string,
  type: string,
  nillable: boolean,
  readonly = false,
) =>
  `${readonly ? 'readonly ' : ''}${escapeString(name)}${
    nillable ? '?' : ''
  }: ${type}${nillable ? ' | null | undefined' : ''}`

/**
 * Converts a Salesforce field description to a typescript interface entry in the form
 * `fieldName: fieldType`
 * @param f A DescribeSObject field
 * @param newtype whether to use more specific types - defaults to false
 */
export const fieldToKvType = (
  f: Field,
  newtype: boolean,
  typeResolver: SF2TSTypeMap,
) => {
  const { nillable, name } = f

  const fn = typeResolver[f.type]
  const readonly = !f.updateable && !f.createable

  return createKvType(name, fn(f, newtype), nillable, readonly)
}

const getResolvedType = (f: Option<string>) => (f.isNone() ? 'object' : f.value)

export const parentFieldToKvType = (
  f: Field,
  resolver: (name: string) => Option<string>,
) => {
  const name = fromNullable(f.relationshipName)

  return name.chain(n => {
    const refs = f.referenceTo || []

    const types = refs.map(
      pipe(
        resolver,
        getResolvedType,
      ),
    )

    const readonly = !f.updateable && !f.createable

    return types.length
      ? some(createKvType(n, joinUnion(types), f.nillable, readonly))
      : none
  })
}

export const childFieldToKvType = (
  f: ChildRelationship,
  resolver: (name: string) => Option<string>,
  soResolver: (name: string) => Option<DescribeSObjectResult>,
) => {
  const name = fromNullable(f.relationshipName)

  // a child field is nillable if the parent field in the related object is nillable?
  const field = soResolver(f.childSObject)
    .chain(o => fromNullable(o.fields.find(ff => ff.name === f.childSObject)))
    .toUndefined()
  return name.map(n => {
    const ref = resolver(f.childSObject)
    return createKvType(
      n,
      `Array<${getResolvedType(ref)}>`,
      field ? field.nillable : true,
    )
  })
}
