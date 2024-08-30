import {createLogger, format, transports} from 'winston'
import {IError, ILog} from '../types/logger.js'
import {LOG_LEVELS} from './constants.js'

const logger = createLogger({
  level: 'info',
  exitOnError: false,
  format: format.combine(
    format.colorize(),
    format.timestamp(),
    format.printf(
      info =>
        `${info.timestamp} ${info.level}: ${info.message}${
          info.data && Object.keys(info.data).length > 0 ? ` => ${JSON.stringify(info.data)}` : ''
        }`,
    ),
  ),
  transports: [new transports.Console()],
  exceptionHandlers: [new transports.Console()],
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const logInfo = (message: string, data?: any): ILog => {
  logger.info(message, {data})

  return {message, data, level: LOG_LEVELS.INFO}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const logDebug = (message: string, data?: any): ILog => {
  logger.debug(message, {data})

  return {message, data, level: LOG_LEVELS.DEBUG}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const logError = (message: string, data?: any): ILog => {
  logger.error(message)
  logger.error(data)

  return {message, data, level: LOG_LEVELS.ERROR}
}

export const handleLog =
  (logs: ILog[]) =>
  (log?: ILog, space = false): ILog => {
    if (log) {
      let data = log.data
      const {level, message} = log

      if (data && typeof data === 'object') {
        data = JSON.stringify(data, null, '  ')
      }

      logs.push({level, message: `${message}${data ? ` => ${data}` : ''}`})

      return log
    }

    const empty = {level: '', message: ''}

    if (space) {
      logs.push(empty)
    }

    return empty
  }

export const handleLogError =
  (logs: ILog[], errors: IError[]) =>
  (error: IError): IError => {
    let data = error.data
    const {title, message} = error

    if (typeof data === 'object') {
      data = JSON.stringify(data, null, '  ')
    }

    errors.push(error)
    handleLog(logs)({
      level: LOG_LEVELS.ERROR,
      message: `${title}${data ? ` => ${data}` : ''}${message ? ` => ${message}` : ''}`,
    })

    return error
  }

export default logger
