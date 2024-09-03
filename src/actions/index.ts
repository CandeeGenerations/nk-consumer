import {PROCESS_IMAGE, SEND_EMAIL} from '../types/consumer.js'
import processImage from './processImage.js'
import sendEmail from './sendEmail.js'

export default {
  [SEND_EMAIL]: sendEmail,
  [PROCESS_IMAGE]: processImage,
}
