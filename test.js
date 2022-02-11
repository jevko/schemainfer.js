import {interJevkoToSchema} from './mod.js'
import {parseJevko} from './devDeps.js'

console.log(JSON.stringify(interJevkoToSchema(parseJevko(`
first name [John]
last name [Smith]
is alive [true]
age [27]
address [
  street address [21 2nd Street]
  city [New York]
  state [NY]
  postal code [10021-3100]
]
phone numbers [
  [
    type [home]
    number [212 555-1234]
  ]
  [
    type [office]
    number [646 555-4567]
  ]
]
children []
spouse []
`)), null, 2))