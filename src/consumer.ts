import {Consumer, ConsumerOptions} from 'sqs-consumer'
import handlers from './actions/index.js'
import config from './common/config.js'
import {logError, logInfo} from './common/logger.js'
import {S3Message} from './types/consumer.js'
import {SendEmailMessage} from './types/email.js'

type MessageType = SendEmailMessage | S3Message // add more types here
type HandlerFunctionType = {
  // eslint-disable-next-line no-unused-vars
  handle: (messageBody: MessageType) => Promise<string>
}

const handleMessage: ConsumerOptions['handleMessage'] = async message => {
  const action = message.MessageAttributes?.['Action']?.StringValue

  if (!action) {
    logError('No action found in message')
    return
  }

  if (!message.Body) {
    logError('No body found in message')
    return
  }

  const logMessage = `(${action}) => ${message.Body}`

  logInfo(`Received message: ${logMessage}`)

  let messageBody: MessageType | null = null

  try {
    messageBody = JSON.parse(message.Body)
  } catch {
    logError(`Cannot process message; failed to parse message body`)
    return
  }

  if (!messageBody) {
    logError(`Cannot process message; failed to parse message body`)
    return
  }

  const handler: HandlerFunctionType = handlers[action]

  if (!handler) {
    logError(`Cannot process message; no handler found for: (${action})`)
    return
  }

  const id = await handler.handle(messageBody)

  logInfo(`Message processed successfully: ${id}`)
}

const consumer = Consumer.create({
  region: config.aws.region,
  queueUrl: config.aws.sqsUrl,
  attributeNames: ['All'],
  messageAttributeNames: ['All'],
  handleMessage,
})

consumer.on('error', err => {
  logError(err.message)
})

consumer.on('processing_error', err => {
  logError(err.message)
})

export const startConsumer = () => {
  consumer.start()
  logInfo(`Polling ${config.aws.sqsUrl} for queue messages`)
}
