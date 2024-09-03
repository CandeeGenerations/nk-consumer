import axios, {AxiosInstance} from 'axios'
import config from '../../../common/config.js'

let _client: AxiosInstance | null = null

const getClient = () => {
  if (!_client) {
    const {url, apiKey} = config.freeConvert

    _client = axios.create({
      baseURL: url,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
    })
  }

  return _client
}

export default getClient
