export const SEND_EMAIL = 'send-email' as const

export type ACTION_TYPE = typeof SEND_EMAIL

export interface S3Message {
  filename: string
}
