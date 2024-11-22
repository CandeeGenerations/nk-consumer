import {Consumer, ConsumerOptions} from 'sqs-consumer'

import handlers from './actions/index'
import config from './common/config'
import logger from './common/logger'
import {S3Message} from './types/consumer'
import {SendEmailMessage} from './types/email'

type MessageType = SendEmailMessage | S3Message // add more types here
type HandlerFunctionType = {
  // eslint-disable-next-line no-unused-vars
  handle: (messageBody: MessageType) => Promise<string>
}

const handleMessage: ConsumerOptions['handleMessage'] = async (message) => {
  const action = message.MessageAttributes?.['Action']?.StringValue

  if (!action) {
    logger.error('No action found in message')
    return
  }

  if (!message.Body) {
    logger.error('No body found in message')
    return
  }

  const logMessage = `(${action}) => ${message.Body}`

  logger.info(`Received message: ${logMessage}`)

  let messageBody: MessageType | null = null

  try {
    messageBody = JSON.parse(message.Body)
  } catch {
    logger.error(`Cannot process message; failed to parse message body`)
    return
  }

  if (!messageBody) {
    logger.error(`Cannot process message; failed to parse message body`)
    return
  }

  const handler: HandlerFunctionType = handlers[action]

  if (!handler) {
    logger.error(`Cannot process message; no handler found for: (${action})`)
    return
  }

  const id = await handler.handle(messageBody)

  logger.info(`Message processed successfully: ${id}`)
}

const consumer = Consumer.create({
  region: config.aws.region,
  queueUrl: config.aws.sqsUrl,
  attributeNames: ['All'],
  messageAttributeNames: ['All'],
  handleMessage,
})

consumer.on('error', (err) => {
  logger.error(err.message)
})

consumer.on('processing_error', (err) => {
  logger.error(err.message)
})

export const startConsumer = () => {
  consumer.start()
  logger.info(`Polling ${config.aws.sqsUrl} for queue messages`)
}
