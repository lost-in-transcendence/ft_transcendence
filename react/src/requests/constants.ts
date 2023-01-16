

export const host = import.meta.env.VITE_APP_HOST
export const frontPort = import.meta.env.VITE_FRONT_PORT
export const backPort = import.meta.env.VITE_BACK_PORT
export const protocol = import.meta.env.VITE_PROTOCOL
export const appURL = `${protocol}${host}`
export const frontURL = `${appURL}:${frontPort}`
export const backURL = `${appURL}:${backPort}`
