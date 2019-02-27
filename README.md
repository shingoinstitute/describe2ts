# describe2ts

Converts a salesforce DescribeSObjectResult object (typically produced by jsforce)
to a salesforce interface

## Usage Example

```ts
import describe2ts from 'describe2ts'
import { writeFileSync } from 'fs'

// describe files retrieved from somewhere
const describes: DescribeSObjectResult[] = getDescribes()

const nameMatch = ['Contact', 'Account']

// only create interfaces for the objects in the nameMatch array
const resolver = (name: string) =>
  nameMatch.includes(name) ? `import("./${name}").default` : null

// used for determining nillability of child relationships
// this is optional
const sobjectResolver = (name: string) => describes.find(d => d.name === name)

for (const desc of describes) {
  const iface = describe2ts(desc, resolver, sobjectResolver)
  writeFileSync(`${desc.name}.ts`, iface, 'utf8')
}
```

## API

### describe2ts

| Parameter       | Type                                                                                               | Description                                                                                     | Required |
| --------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | -------- |
| desc            | `DescribeSObjectResult`                                                                            | a DescribeSObjectResult object                                                                  | ✓        |
| resolver        | `string => Option<string> | string | null | undefined`                                             | a function that resolves the name of a Salesforce Object to a typescript type string            | ✓        |
| sobjectResolver | `undefined | (string => Option<DescribeSObjectResult> | DescribeSObjectResult | null | undefined)` | an optional function that resolves the name of a Salesforce Object to its DescribeSObjectResult | ✗        |
| newtype         | `undefined | boolean`                                                                              | use newtypes instead of typescript primitives                                                   | ✗        |
| sfTypeResolver  | `undefined | { readonly [k in FieldType]: (f: Field, newtype?: boolean) => string }`               | a map of functions from salesforce types to typescript types                                    | ✗        |
| defaultExport   | `undefined | boolean`                                                                              | add a default export line to the output text                                                    | ✗        |
