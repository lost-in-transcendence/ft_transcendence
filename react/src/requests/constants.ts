

export const host = await import.meta.env.VITE_APP_HOST
export const frontPort = await import.meta.env.VITE_FRONT_PORT
export const backPort = await import.meta.env.VITE_BACK_PORT
export const protocol = await import.meta.env.VITE_PROTOCOL
export const appURL = `${protocol}${host}`
export const frontURL = `${appURL}:${frontPort}`
export const backURL = `${appURL}:${backPort}`