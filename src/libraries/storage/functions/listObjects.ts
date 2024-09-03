import {ListObjectsCommand} from '@aws-sdk/client-s3'
import getClient from './getClient.js'

const listObjects = async ({bucket}: {bucket: string}) => {
  const client = getClient()

  const command = new ListObjectsCommand({
    Bucket: bucket,
  })

  const response = await client.send(command)

  return response.Contents || []
}

export default listObjects
