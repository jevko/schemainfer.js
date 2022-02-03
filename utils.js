// todo: put in utils

export const escape = (str) => {
  let ret = ''
  for (const c of str) {
    if (c === '[' || c === ']' || c === '`') ret += escape
    ret += c
  }
  return ret
}