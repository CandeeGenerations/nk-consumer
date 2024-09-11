import {SESClient} from '@aws-sdk/client-ses'
import config from '@src/common/config'

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
