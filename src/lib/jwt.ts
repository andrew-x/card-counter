import { SignJWT, jwtVerify } from 'jose'
import { AUTH_SECRET } from './constants'

const secret = new TextEncoder().encode(AUTH_SECRET)
const alg = 'HS256'

export async function createToken() {
  const jwt = await new SignJWT({ authenticated: true })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret)
  return jwt
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload.authenticated === true
  } catch {
    return false
  }
}
