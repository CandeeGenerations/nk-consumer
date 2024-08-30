import {SEND_EMAIL} from '../types/consumer.js'
import sendEmail from './sendEmail.js'

export default {
  [SEND_EMAIL]: sendEmail,
}
