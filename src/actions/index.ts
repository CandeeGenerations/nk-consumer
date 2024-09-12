import {SEND_EMAIL} from '../types/consumer'
import sendEmail from './sendEmail'

export default {
  [SEND_EMAIL]: sendEmail,
}
