import {SendRawEmailCommand} from '@aws-sdk/client-ses'
import uniq from 'lodash/uniq.js'
import {createMimeMessage, Mailbox} from 'mimetext'
import {Buffer} from 'node:buffer'
import config from '../../../common/config.js'
import {OVERRIDE_EMAIL} from '../../../common/constants.js'
import {logError, logInfo} from '../../../common/logger.js'
import getClient from './getClient.js'

const sendEmail = async data => {
  const ses = getClient()
  const {overrideSendList} = config.email

  const toList =
    overrideSendList === 'true' ? [OVERRIDE_EMAIL] : (uniq(data.to?.split(',').filter(x => x !== '')) as string[])

  if (toList.length === 0) {
    logError('No one to send email to')
    return
  }

  logInfo(`Sending email to ${toList.map(x => x).join(',')}...`)

  const message = createMimeMessage()

  message.setSender(data.from ? `${data.from.name} <${data.from.email}>` : '')
  message.setTo(toList)
  message.setSubject(data.subject)
  message.addMessage({
    contentType: 'text/html',
    data: data.html,
  })

  if (data.attachments) {
    data.attachments.forEach(x => message.addAttachment(x))
  }

  const command = new SendRawEmailCommand({
    Destinations: ((message.getRecipients({type: 'To'}) || []) as Mailbox[]).map(mailbox => mailbox.addr),
    RawMessage: {
      Data: Buffer.from(message.asRaw(), 'utf8'),
    },
    Source: message.getSender()?.addr,
  })

  try {
    await ses.send(command)

    logInfo(`Email sent to ${toList.map(x => x).join(',')} from ${data.from?.email || ''}: [subject] ${data.subject}`)
  } catch (error) {
    logError('Error sending email', error)
  }
}

export default sendEmail
