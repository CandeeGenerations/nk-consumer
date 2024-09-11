import config from '@/src/common/config'
import {SESClient} from '@aws-sdk/client-ses'

let _client: SESClient | null = null

const getClient = () => {
  if (!_client) {
    _client = new SESClient({
      region: config.aws.region,
    })
  }

  return _client
}

export default getClient
