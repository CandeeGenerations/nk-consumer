import {GetObjectCommand} from '@aws-sdk/client-s3'

import getClient from './getClient'

const getObject = async ({bucket, filename}: {bucket: string; filename: string}) => {
  const client = getClient()

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: filename,
  })

  const response = await client.send(command)

  if (!response.Body) {
    throw new Error(`File not found or empty: (${filename})`)
  }

  return response.Body
}

export default getObject
