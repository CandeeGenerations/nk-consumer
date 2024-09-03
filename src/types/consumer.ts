export const SEND_EMAIL = 'send-email' as const
export const PROCESS_IMAGES = 'process-images' as const

export type ACTION_TYPE = typeof SEND_EMAIL | typeof PROCESS_IMAGES

export interface S3Message {
  filename: string
}
