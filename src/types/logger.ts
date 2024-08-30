export interface ILog {
  level: string
  data?: unknown
  message: string
  space?: boolean
}

export interface ILogs {
  logs: ILog[]
}

export interface ILogsAndErrors extends ILogs {
  errors: IError[]
}

export interface IError {
  code?: string
  title: string
  data?: string | object
  message?: string
}

export interface IException {
  name: string
  message: string
}
