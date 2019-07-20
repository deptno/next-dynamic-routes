export const toExpressPath = path => {
  return path
    .split('/')
    .map((p) => {
      if (p.startsWith('[')) {
        if (p.endsWith(']')) {
          return `:${p.slice(1, p.length - 1)}`
        }
      }
      return p
    })
    .join('/')
}
