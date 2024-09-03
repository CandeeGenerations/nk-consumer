import config from '../../../common/config.js'
import getClient from './getClient.js'

const convertImageJob = async (objectKey: string) => {
  const client = getClient()
  const {originalImagesBucket, convertedImagesBucket, region, accessKeyId, secretAccessKey} = config.aws

  const filenameSplit = objectKey.split('.')
  const filename = filenameSplit.slice(0, -1).join('.')

  const response = await client.post('/process/jobs', {
    tasks: {
      import: {
        operation: 'import/s3',
        bucket: originalImagesBucket,
        region: region,
        key: objectKey,
        access_key_id: accessKeyId,
        secret_access_key: secretAccessKey,
      },
      convert: {
        operation: 'convert',
        input: 'import',
        output_format: 'jpg',
        options: {
          image_resize_percentage: 50,
          background: '#FFFFFF',
          jpg_convert_compression_level: 80,
          'auto-orient': true,
          strip: true,
        },
      },
      export: {
        operation: 'export/s3',
        input: ['convert'],
        bucket: convertedImagesBucket,
        region: region,
        key: `${filename}.jpg`,
        access_key_id: accessKeyId,
        secret_access_key: secretAccessKey,
      },
    },
  })

  return response.data
}

export default convertImageJob
