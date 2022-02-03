import {escape} from './utils.js'

const transplit = (json, setSchema) => {
  if (typeof json === 'string') {
    setSchema('string')
    return escape(json)
  }
  if (typeof json === 'number') {
    setSchema('float64')
    return json.toString()
  }
  if (typeof json === 'boolean') {
    setSchema('boolean')
    return json.toString()
  }
  if (json === null) {
    setSchema('null')
    return 'null'
  }
  if (Array.isArray(json)) {
    // todo: if all items are the same type, make it an array
    setSchema('tuple')
    // todo: to jevko tree
    let ret = []
    for (const val of json) {
      ret.push(transplit(val, setSchema))
    }
    return ret
  }
  // assume object
  setSchema('object')
  const entries = Object.entries(json)
  // todo: to jevko tree
  let ret = []
  for (const val of json) {
    ret.push(transplit(val), setSchema)
  }
  return ret
}


// infers schema from JSON
export const jsonToSchema = (json) => {
  if (typeof json === 'string') {
    return {type: 'string'}
  }
  if (typeof json === 'number') {
    return {type: 'float64'}
  }
  if (typeof json === 'boolean') {
    return {type: 'boolean'}
  }
  if (json === null) {
    return {type: 'null'}
  }
  if (Array.isArray(json)) {
    // todo: if all items are the same type, make it an array
    const itemSchemas = []
    for (const val of json) {
      itemSchemas.push(jsonToSchema(val))
    }
    return {type: 'tuple', itemSchemas}
  }
  const entries = Object.entries(json)

  let props = Object.create(null)
  for (const [key, val] of entries) {
    props[key] = jsonToSchema(val)
  }
  return {type: 'object', props}
}

// todo: use to implement array schema
const areSchemasEqual = (a, b) => {
  const {type} = a
  if (type !== b.type) return false
  
  // note: assuming primitive types can't be refined further (won't be true in future)
  if (['string', 'float64', 'boolean', 'null'].includes(type)) return true

  if (type === 'tuple') return 'todo'
  if (type === 'array') return 'todo'
  if (type === 'object') return 'todo'
}

// infers schema from interjevko
export const interJevkoToSchema = (jevko) => {
  const {subjevkos, suffix} = jevko

  if (subjevkos.length === 0) {
    const trimmed = suffix.trim()

    // todo: perhaps only untrimmed are ok, otherwise it's a string
    if (['true', 'false'].includes(trimmed)) return {type: 'boolean'}
    if (trimmed === 'null') return {type: 'null'}

    if (trimmed === 'NaN') return {type: 'float64'}
    const num = Number.parseFloat(trimmed)
    if (Number.isNaN(num)) return {type: 'string'}
    return {type: 'float64'}
  }

  const {prefix} = subjevkos[0]
  if (prefix.trim() === '') {
    // tuple/array
    const itemSchemas = []
    for (const {prefix, jevko} of subjevkos) {
      if (prefix.trim() !== '') throw Error('bad tuple/array')
      itemSchemas.push(interJevkoToSchema(jevko))
    }
    return {type: 'tuple', itemSchemas}
  }

  const props = Object.create(null)
  for (const {prefix, jevko} of subjevkos) {
    // todo: handle verbatim keys
    // todo: handle duplicate and empty keys
    const key = prefix.trim()
    props[key] = interJevkoToSchema(jevko)
  }
  return {type: 'object', props}
}