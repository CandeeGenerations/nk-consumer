export const SEND_EMAIL = 'send-email' as const
export const PROCESS_IMAGE = 'process-image' as const

export type ACTION_TYPE = typeof SEND_EMAIL | typeof PROCESS_IMAGE
