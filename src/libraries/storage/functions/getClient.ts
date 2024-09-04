import {S3Client} from '@aws-sdk/client-s3'
import config from '../../../common/config.js'

let _client: S3Client | null = null

export const getClient = () => {
  if (!_client) {
    const {secretAccessKey, accessKeyId, region} = config.aws

    _client = new S3Client({
      region,
      credentials:
        accessKeyId && secretAccessKey
          ? {
              accessKeyId,
              secretAccessKey,
            }
          : undefined,
    })
  }

  return _client
}

export default getClient
