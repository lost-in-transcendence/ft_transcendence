import { env } from 'process'


export const host = env.APP_HOST
export const frontPort = env.FRONT_PORT
export const backPort = env.BACK_PORT
export const protocol = env.PROTOCOL
export const appURL = `${protocol}://${host}`
export const frontURL = `${appURL}:${frontPort}`
export const backURL = `${appURL}:${backPort}`