import config from '../common/config.js'
import {convertImage} from '../libraries/image-convert/index.js'
import * as storage from '../libraries/storage/index.js'
import {S3Message} from '../types/consumer.js'

// MARK: Handle function
const handle = async ({filename}: S3Message) => {
  const response = await storage.getObject({bucket: config.aws.sqsBucket, filename: filename})
  const contents = await response.transformToString()
  const imagesToProcess: string[] = JSON.parse(contents)

  for (const imageToProcess of imagesToProcess) {
    await convertImage(imageToProcess)
  }

  return filename
}

export default {handle}
