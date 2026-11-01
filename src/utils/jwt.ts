// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function decodeToken(token: string): any | null {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload))
  } catch (err) {
    console.error('Invalid token:', err)
    return null
  }
}
