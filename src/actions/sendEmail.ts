import {GetObjectCommand, S3Client} from '@aws-sdk/client-s3'
import {SendRawEmailCommand, SESClient} from '@aws-sdk/client-ses'
import dayjs from 'dayjs'
import fs from 'fs'
import handlebars from 'handlebars'
import lodash from 'lodash'
import {createMimeMessage, Mailbox} from 'mimetext'
import {Buffer} from 'node:buffer'
import path from 'path'
import puppeteer from 'puppeteer'
import config from '../common/config.js'
import {
  DATE_FORMAT,
  DATE_TIME_FORMAT,
  OVERRIDE_EMAIL,
  PDF_OPTIONS,
  PUPPETEER_OPTIONS,
  TEMPLATE_LOC,
} from '../common/constants.js'
import {logError, logInfo} from '../common/logger.js'
import {
  AnyEmail,
  IInspectionReportEmail,
  IJobEventEmail,
  INSPECTION_REPORT_APPROVED_EMAIL,
  INSPECTION_REPORT_REJECTED_EMAIL,
  INSPECTION_REPORT_SUBMISSION_EMAIL,
  ITripChargeEmail,
  JOB_EVENT_EMAIL,
  SendEmailMessage,
  TEST_EMAIL,
  TRIP_CHARGE_EMAIL,
} from '../types/email.js'

const {
  worker: {defaultFromEmail, defaultFromName, siteUrl, overrideSendList},
  aws: {region},
} = config

// #region Functions
const compileEmail = (template: string) =>
  handlebars.compile(fs.readFileSync(path.join(path.resolve(), TEMPLATE_LOC, `${template}.hbs`), 'utf8'))

const getReplyToList = (replyTo: string | undefined): string[] => lodash.uniq(replyTo?.split(',').map(x => x) || [])

const formatDates = email => ({
  ...email,
  dateCreated: dayjs(email.dateCreated).format(DATE_TIME_FORMAT),
  originalInstallDate: email.originalInstallDate ? dayjs(email.originalInstallDate).format(DATE_FORMAT) : undefined,
  inspectionRepairDate: email.inspectionRepairDate ? dayjs(email.inspectionRepairDate).format(DATE_FORMAT) : undefined,
  dateOfRequest: email.dateOfRequest ? dayjs(email.dateOfRequest).format(DATE_FORMAT) : undefined,
})

// MARK: Send Email
const sendEmail = async data => {
  const ses = new SESClient({region})

  const toList =
    overrideSendList === 'true'
      ? [OVERRIDE_EMAIL]
      : (lodash.uniq(data.to?.split(',').filter(x => x !== '')) as string[])

  if (toList.length === 0) {
    logError('No one to send email to')
    return
  }

  logInfo(`Sending email to ${toList.map(x => x).join(',')}...`)

  const message = createMimeMessage()

  message.setSender(data.from ? `${data.from.name} <${data.from.email}>` : '')
  message.setTo(toList)
  message.setSubject(data.subject)
  message.addMessage({
    contentType: 'text/html',
    data: data.html,
  })

  if (data.attachments) {
    data.attachments.forEach(x => message.addAttachment(x))
  }

  const command = new SendRawEmailCommand({
    Destinations: ((message.getRecipients({type: 'To'}) || []) as Mailbox[]).map(mailbox => mailbox.addr),
    RawMessage: {
      Data: Buffer.from(message.asRaw(), 'utf8'),
    },
    Source: message.getSender()?.addr,
  })

  try {
    await ses.send(command)

    logInfo(`Email sent to ${toList.map(x => x).join(',')} from ${data.from?.email || ''}: [subject] ${data.subject}`)
  } catch (error) {
    logError('Error sending email', error)
  }
}
// #endregion

// #region
// MARK: Send test email
const sendTestEmail = async ({to}: {to: string}) => {
  await sendEmail({
    to,
    from: {
      email: defaultFromEmail,
      name: defaultFromName,
    },
    subject: 'Test Email Notification',
    html: compileEmail('notification')({
      subtitle: 'NK Notification',
      title: 'Test Notification',
      message: 'This is a test',
      year: dayjs().format('YYYY'),
    }),
  })
}

// MARK: Inspection Report Submission
const sendInspectionReportSubmissionEmail = async ({to, replyTo, ...email}: IInspectionReportEmail) => {
  await sendEmail({
    to,
    replyToList: getReplyToList(replyTo),
    from: {
      email: defaultFromEmail,
      name: defaultFromName,
    },
    subject: 'APPROVAL REQUESTED: Inspection Report Submitted',
    html: compileEmail('inspection-report-submission')({
      pretitle: 'NK Notification',
      title: 'Inspection Report Submitted',
      headerTitle: 'Please review the Inspection Report below:',
      preheader: 'APPROVAL REQUESTED: Inspection Report Submitted',
      siteUrl,
      year: dayjs().format('YYYY'),
      ...formatDates(email),
    }),
  })
}

// MARK: Inspection Report Approved
const sendInspectionReportApprovedEmail = async ({to, replyTo, approveEmails, ...email}: IInspectionReportEmail) => {
  const payload = {
    title: 'Inspection Report Approved',
    headerTitle: 'The following Inspection Report has been Approved:',
    preheader: 'APPROVED: Inspection Report Approved',
    siteUrl,
    year: dayjs().format('YYYY'),
    ...formatDates(email),
  }
  const pdfHtml = compileEmail('inspection-report-pdf')(payload)
  const browser = await puppeteer.launch(PUPPETEER_OPTIONS)
  const page = await browser.newPage()
  await page.setContent(pdfHtml)
  const pdf = await page.pdf(PDF_OPTIONS)

  const emailData = {
    to,
    replyToList: getReplyToList(replyTo),
    from: {
      email: defaultFromEmail,
      name: defaultFromName,
    },
    subject: 'APPROVED: Inspection Report Approved',
    html: compileEmail('inspection-report-approved')(payload),
    attachments: [
      {
        filename: `${payload.originalInstallerName}__${payload.projectNumber}__${payload.customerName}__${payload.id}.pdf`,
        data: Buffer.from(pdf).toString('base64'),
        contentType: 'application/pdf',
      },
    ],
  }

  await sendEmail(emailData)

  if (approveEmails) {
    return await sendEmail({
      ...emailData,
      to: approveEmails,
      subject: `NK Inspection Report Form PDF -- ${payload.originalInstallerCrewNumber}`,
    })
  }
}

// MARK: Inspection Report Rejected
const sendInspectionReportRejectedEmail = async ({to, replyTo, ...email}: IInspectionReportEmail) => {
  await sendEmail({
    to,
    replyToList: getReplyToList(replyTo),
    from: {
      email: defaultFromEmail,
      name: defaultFromName,
    },
    subject: 'REJECTED: Inspection Report Rejected',
    html: compileEmail('inspection-report-rejected')({
      title: 'Inspection Report Rejected',
      headerTitle: 'The following Inspection Report has been Rejected:',
      preheader: 'REJECTED: Inspection Report Rejected',
      siteUrl,
      year: dayjs().format('YYYY'),
      ...formatDates(email),
    }),
  })
}

// MARK: Job Event Emails
const sendJobEventEmail = async ({to, replyTo, ...email}: IJobEventEmail) => {
  const title = `${email.customerName} | ${email.projectNumber} | ${email.crewNumber} | BUSTED JOB: ${email.bustedJob} | Material Problem: ${email.materialProblem}`
  const payload = {
    pretitle: 'NK Notification',
    headerTitle: 'Please review the Job Event below:',
    preheader: 'Job Event Submitted',
    title,
    siteUrl,
    year: dayjs().format('YYYY'),
    ...formatDates(email),
    jobEventPosArray: JSON.parse(email.jobEventPos),
    jobEventType: email.jobEventType.join(', '),
  }
  const pdfHtml = compileEmail('job-event-pdf')(payload)
  const browser = await puppeteer.launch(PUPPETEER_OPTIONS)
  const page = await browser.newPage()
  await page.setContent(pdfHtml)
  const pdf = await page.pdf(PDF_OPTIONS)

  const emailData = {
    to,
    replyToList: getReplyToList(replyTo),
    from: {
      email: defaultFromEmail,
      name: defaultFromName,
    },
    subject: title,
    html: compileEmail('job-event')(payload),
    attachments: [
      {
        filename: `${email.customerName}_${email.projectNumber}_${email.jobEventType}.pdf`,
        data: Buffer.from(pdf).toString('base64'),
        contentType: 'application/pdf',
      },
    ],
  }

  await sendEmail(emailData)
}

// MARK: Trip Charge Emails
const sendTripChargeEmail = async ({to, replyTo, ...email}: ITripChargeEmail) => {
  const title = 'New Trip Charge Request'
  const payload = {
    title,
    pretitle: 'NK Notification',
    headerTitle: 'Please review the Trip Charge below:',
    preheader: 'Trip Charge Submitted',
    siteUrl,
    year: dayjs().format('YYYY'),
    ...formatDates(email),
  }

  const emailData = {
    to,
    replyToList: getReplyToList(replyTo),
    from: {
      email: defaultFromEmail,
      name: defaultFromName,
    },
    subject: title,
    html: compileEmail('trip-charge')(payload),
  }

  await sendEmail(emailData)
}

const handlers = {
  [TEST_EMAIL]: sendTestEmail,
  [INSPECTION_REPORT_SUBMISSION_EMAIL]: sendInspectionReportSubmissionEmail,
  [INSPECTION_REPORT_APPROVED_EMAIL]: sendInspectionReportApprovedEmail,
  [INSPECTION_REPORT_REJECTED_EMAIL]: sendInspectionReportRejectedEmail,
  [JOB_EVENT_EMAIL]: sendJobEventEmail,
  [TRIP_CHARGE_EMAIL]: sendTripChargeEmail,
}
// #endregion

// MARK: Handle function
const handle = async (message: SendEmailMessage) => {
  const s3Client = new S3Client({region: config.aws.region})
  const command = new GetObjectCommand({
    Bucket: config.aws.sqsBucket,
    Key: message.filename,
  })

  const response = await s3Client.send(command)

  if (!response.Body) {
    logError(`Cannot send email; no body found in message: (${message.filename})`)
    return
  }

  const contents = await response.Body.transformToString()
  const emailMessage: AnyEmail = JSON.parse(contents)

  await handlers[message.emailType](emailMessage)

  return message.emailType
}

export default {handle}
