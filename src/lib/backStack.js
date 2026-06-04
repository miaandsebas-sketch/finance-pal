const stack = []
if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    const fn = stack.pop()
    if (fn) fn()
  })
}
export const pushBack = fn => { stack.push(fn); history.pushState({}, '') }
