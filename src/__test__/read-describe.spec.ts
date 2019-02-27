import { SF2TSTypeMap } from '../sf-type'
import {
  fieldToKvType,
  parentFieldToKvType,
  childFieldToKvType,
} from '../read-describe'
// tslint:disable-next-line:no-implicit-dependencies
import { Field, ChildRelationship, DescribeSObjectResult } from 'jsforce'
import { some, none } from 'fp-ts/lib/Option'
// tslint:disable:no-object-literal-type-assertion

describe('fieldToKvType', () => {
  const double = jest.fn()
  double.mockReturnValue('number')
  const resolver = ({ double } as unknown) as SF2TSTypeMap

  it("creates a kv pair (the form 'key': 'value') from a field definition", () => {
    const field = {
      name: 'test',
      type: 'double',
      updateable: true,
      createable: true,
      nillable: false,
    } as Field

    expect(fieldToKvType(field, false, resolver)).toBe('"test": number')
    expect(double).toHaveBeenCalledWith(field, false)
  })

  it('properly handles readonly and nillable properties', () => {
    expect(
      fieldToKvType(
        {
          name: 'test',
          type: 'double',
          updateable: false,
          createable: false,
          nillable: true,
        } as Field,
        false,
        resolver,
      ),
    ).toBe('readonly "test"?: number | null | undefined')
  })
})

describe('parentFieldToKvType', () => {
  const resolver = jest.fn()
  const resolvedType = 'import("./Contact.desc").default'
  resolver.mockReturnValue(some(resolvedType))

  it('creates a kv type pair from a parent field', () => {
    expect(
      parentFieldToKvType(
        {
          relationshipName: 'Parent',
          referenceTo: ['Contact'],
          nillable: false,
          updateable: true,
          createable: true,
        } as Field,
        resolver,
      ),
    ).toEqual(some(`"Parent": ${resolvedType}`))

    expect(resolver).toHaveBeenCalledWith('Contact')
  })

  it('defaults to object if the resolver returns none', () => {
    expect(
      parentFieldToKvType(
        {
          relationshipName: 'Parent',
          referenceTo: ['Contact'],
          nillable: false,
          updateable: true,
          createable: true,
        } as Field,
        () => none,
      ),
    ).toEqual(some(`"Parent": object`))
  })

  it('properly handles readonly and nillable properties', () => {
    expect(
      parentFieldToKvType(
        {
          relationshipName: 'Parent',
          referenceTo: ['Contact'],
          nillable: true,
          updateable: false,
          createable: false,
        } as Field,
        () => none,
      ),
    ).toEqual(some(`readonly "Parent"?: object | null | undefined`))
  })

  it('returns none if the referenceTo array is empty or missing', () => {
    expect(
      parentFieldToKvType(
        {
          relationshipName: 'Parent',
          nillable: true,
          updateable: false,
          createable: false,
        } as Field,
        () => none,
      ),
    ).toEqual(none)
  })
})

describe('childFieldToKvType', () => {
  const resolver = jest.fn()
  const resolvedType = 'import("./Contact.desc").default'
  resolver.mockReturnValue(some(resolvedType))

  it('returns a kv type pair given a child relationship', () => {
    expect(
      childFieldToKvType(
        {
          childSObject: 'Contact',
          relationshipName: 'Contacts',
        } as ChildRelationship,
        resolver,
        () => none,
      ),
    ).toEqual(some(`"Contacts"?: Array<${resolvedType}> | null | undefined`))
  })

  it('uses the resolver function to determine nillability', () => {
    const fn = jest.fn()
    const resolved = {
      fields: [{ name: 'Contact', nillable: false }],
    } as DescribeSObjectResult
    fn.mockReturnValue(some(resolved))

    expect(
      childFieldToKvType(
        {
          childSObject: 'Contact',
          relationshipName: 'Contacts',
        } as ChildRelationship,
        resolver,
        fn,
      ),
    ).toEqual(some(`"Contacts": Array<${resolvedType}>`))

    expect(fn).toHaveBeenCalledWith('Contact')
  })

  it('returns none if the relationshipName is null or undefined', () => {
    expect(
      childFieldToKvType(
        {
          childSObject: 'Contact',
        } as ChildRelationship,
        resolver,
        () => none,
      ),
    ).toEqual(none)
  })
})
