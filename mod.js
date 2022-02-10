// infers schema from JSON
export {jsonToSchema} from 'https://cdn.jsdelivr.net/gh/jevko/jsonjevko.js@v0.1.0/mod.js'

// infers schema from interjevko
export const interJevkoToSchema = (jevko) => {
  const {subjevkos, suffix} = jevko

  const trimmed = suffix.trim()
  if (subjevkos.length === 0) {
    // todo: perhaps only untrimmed are ok, otherwise it's a string
    if (['true', 'false'].includes(trimmed)) return {type: 'boolean'}
    if (trimmed === 'null') return {type: 'null'}

    if (trimmed === 'NaN') return {type: 'float64'}
    if (trimmed === '') return {type: 'string'} // todo: {type: 'empty'}
    const num = Number(trimmed)
    if (Number.isNaN(num)) return {type: 'string'}
    return {type: 'float64'}
  }
  
  if (trimmed !== '') throw Error('suffix must be blank')

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