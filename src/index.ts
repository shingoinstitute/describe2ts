// tslint:disable-next-line: no-implicit-dependencies
import { DescribeSObjectResult } from 'jsforce'
import { Option, none, some, Some, None, fromNullable } from 'fp-ts/lib/Option'
import {
  fieldToKvType,
  childFieldToKvType,
  parentFieldToKvType,
} from './read-describe'
import { fieldTypeToTsType, SF2TSTypeMap } from './sf-type'
import { catOptions } from 'fp-ts/lib/Array'
export { TypeGetter, SF2TSTypeMap, fieldTypeToTsType } from './sf-type'

const resolvefn = <T>(
  fn: (name: string) => Option<T> | T | null | undefined,
) => (name: string): Option<T> => {
  const r = fn(name)
  if (r == null) return none
  if (r instanceof Some || r instanceof None) return r
  return some(r)
}

/**
 * Converts a Salesforce describe result into a typescript type
 * @param desc a DescribeSObjectResult object
 * @param resolver a function that resolves the name of a Salesforce Object to a typescript type
 * @param sobjectResolver an optional function that resolves the name of a Salesforce Object to its DescribeSObjectResult
 * @param newtype use newtypes?
 * @param sfTypeResolver a map of functions from salesforce types to typescript types
 * @param defaultExport add a default export line to the output text
 * @returns a typescript interface type as a string
 */
export const describe2ts = (
  desc: DescribeSObjectResult,
  resolver: (name: string) => Option<string> | string | null | undefined,
  sobjectResolver: (
    name: string,
  ) =>
    | Option<DescribeSObjectResult>
    | DescribeSObjectResult
    | null
    | undefined = () => none,
  newtype = false,
  sfTypeResolver: SF2TSTypeMap = fieldTypeToTsType,
  defaultExport = true,
) => {
  const fn = resolvefn(resolver)
  const sResolver = resolvefn(sobjectResolver)

  const fields = desc.fields.filter(Boolean)
  const parentFields = fields.filter(f => f.relationshipName)
  const childFields = desc.childRelationships || []

  const fieldDefs = fields.map(f => fieldToKvType(f, newtype, sfTypeResolver))
  const childDefs = catOptions(
    childFields.map(f => childFieldToKvType(f, fn, sResolver)),
  )
  const parentDefs = catOptions(
    parentFields.map(f => parentFieldToKvType(f, fn)),
  )

  const name = desc.name

  return (
    [
      `export interface ${name} {`,
      ...fieldDefs,
      ...parentDefs,
      ...childDefs,
    ].join('\n  ') +
    '\n}' +
    (defaultExport ? `\nexport default ${name}` : '')
  )
}

export default describe2ts
