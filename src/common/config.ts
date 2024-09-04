/* eslint-disable no-undef */
export default {
  email: {
    defaultFromEmail: process.env.DEFAULT_FROM_EMAIL || 'notifications@nkinstallations.com',
    defaultFromName: process.env.DEFAULT_FROM_NAME || 'NK Notifications',
    siteUrl: process.env.SITE_URL || 'http://localhost:7700',
    overrideSendList: process.env.OVERRIDE_SEND_LIST || true,
  },
  freeConvert: {
    url: process.env.FREE_CONVERT_URL,
    apiKey: process.env.FREE_CONVERT_API_KEY,
  },
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    convertedImagesBucket: process.env.CONVERTED_IMAGES_BUCKET,
    originalImagesBucket: process.env.ORIGINAL_IMAGES_BUCKET || '',
    sqsUrl: process.env.SQS_URL || '',
    sqsBucket: process.env.SQS_BUCKET || '',
  },
  port: process.env.PORT || 7702,
  env: process.env.NODE_ENV || 'development',
}
