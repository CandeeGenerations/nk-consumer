import config from '../../../common/config.js'
import {logError, logInfo} from '../../../common/logger.js'
import * as storage from '../../storage/index.js'
import getClient from './getClient.js'

const waitForSeconds = async (seconds: number) => await new Promise(resolve => setTimeout(resolve, seconds * 1000))

const waitForJobByPolling = async (jobId: string, filename: string) => {
  await waitForSeconds(1)
  const client = getClient()
  const jobGetResponse = await client.get(`/process/jobs/${jobId}`)

  const job = jobGetResponse.data

  if (job.status === 'completed') {
    await storage.deleteObject({bucket: config.aws.originalImagesBucket, filename})

    const exportTask = job.tasks.find(t => t.name === 'export')
    logInfo(`Completed convert job`, exportTask.result.url)
  } else if (job.status === 'failed') {
    throw new Error('Job failed')
  } else {
    waitForJobByPolling(job.id, filename)
  }
}

const convertImage = async (objectKey: string) => {
  const client = getClient()
  const {originalImagesBucket, convertedImagesBucket, region, accessKeyId, secretAccessKey} = config.aws

  try {
    await storage.getObject({bucket: originalImagesBucket, filename: objectKey})
  } catch {
    logError(`Cannot convert image; file not found in original bucket: (${objectKey})`)
    return
  }

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

  const job = response.data
  await waitForJobByPolling(job.id, objectKey)
}

export default convertImage
