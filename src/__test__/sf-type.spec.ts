import { getPicklistType, createGetter } from '../sf-type'
// tslint:disable-next-line:no-implicit-dependencies
import { Field, PicklistEntry } from 'jsforce'

// tslint:disable: no-object-literal-type-assertion

describe('getPicklistType', () => {
  it('returns a valid typescript type for a picklist (a union of the possible string values)', () => {
    expect(
      getPicklistType({
        picklistValues: [
          { value: 'hi', active: true, defaultValue: false },
          { value: '"some"quoted', active: true, defaultValue: false },
          { value: 'hey', active: false, defaultValue: false },
        ],
      } as Field),
    ).toEqual(`"hi" | "\\"some\\"quoted"`)
  })
  it("returns the 'string' type if picklist values is null or empty", () => {
    expect(
      getPicklistType({ picklistValues: [] as PicklistEntry[] } as Field),
    ).toBe('string')
    expect(getPicklistType({ picklistValues: null } as Field)).toBe('string')
    expect(getPicklistType({} as Field)).toBe('string')
  })
})

describe('createGetter', () => {
  it('returns a function that returns a typescript import type or a primitive depending on the newtype parameter', () => {
    const x = createGetter('string', 'foo/bar')
    expect(typeof x).toBe('function')
    expect(x({} as Field)).toBe('string')
    expect(x({} as Field, true)).toBe('import("foo/bar").default')
    const y = createGetter('string', 'foo/bar', 'baz')
    expect(y({} as Field, true)).toBe('import("foo/bar").baz')
  })
})
