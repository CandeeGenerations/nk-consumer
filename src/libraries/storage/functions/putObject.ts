import {PutObjectCommand} from '@aws-sdk/client-s3'

import getClient from './getClient'

const putObject = async ({bucket, filename, data}: {bucket: string; filename: string; data: string | Uint8Array}) => {
  const client = getClient()

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: filename,
    Body: data,
  })

  await client.send(command)
}
export default putObject
