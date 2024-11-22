import Winston, {format} from 'winston'

import config from './config'

const {levels} = Winston.config.npm
const LOG_LEVEL: string = config.env === 'production' ? 'info' : 'debug'

const formatters = [format.metadata(), format.timestamp()]

if (config.env !== 'production') {
  formatters.push(
    format.colorize({all: true}),
    format.printf(
      ({timestamp, level, message, metadata}) =>
        `[${level}] ${timestamp}: ${message} ${JSON.stringify(metadata, null, 2)}`,
    ),
  )
}

const logger = Winston.createLogger({
  levels,
  transports: [
    new Winston.transports.Console({
      level: LOG_LEVEL,
      format: format.combine(...formatters),
    }),
  ],
})

logger.info('Initialized logger', {LOG_LEVEL})

export default logger
