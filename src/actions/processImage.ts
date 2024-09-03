// MARK: Handle function
const handle = async (message: SendEmailMessage) => {
  const s3Client = new S3Client({region: config.aws.region})
  const command = new GetObjectCommand({
    Bucket: config.aws.sqsBucket,
    Key: message.filename,
  })

  const response = await s3Client.send(command)

  if (!response.Body) {
    logError(`Cannot send email; no body found in message: (${message.filename})`)
    return
  }

  const contents = await response.Body.transformToString()
  const emailMessage: AnyEmail = JSON.parse(contents)

  await handlers[message.emailType](emailMessage)

  return message.emailType
}

export default {handle}
