import {DeleteObjectCommand} from '@aws-sdk/client-s3'
import getClient from './getClient.js'

const listObjects = async ({bucket, filename}: {bucket: string; filename: string}) => {
  const client = getClient()

  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: filename,
  })

  await client.send(command)
}

export default listObjects
