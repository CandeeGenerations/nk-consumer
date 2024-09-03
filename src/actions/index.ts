import {PROCESS_IMAGES, SEND_EMAIL} from '../types/consumer.js'
import processImages from './processImages.js'
import sendEmail from './sendEmail.js'

export default {
  [SEND_EMAIL]: sendEmail,
  [PROCESS_IMAGES]: processImages,
}
