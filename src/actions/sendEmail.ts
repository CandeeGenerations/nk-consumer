import dayjs from 'dayjs'
import fs from 'fs'
import handlebars from 'handlebars'
import uniq from 'lodash/uniq.js'
import {Buffer} from 'node:buffer'
import path from 'path'
import puppeteer from 'puppeteer'
import config from '../common/config.js'
import {DATE_FORMAT, DATE_TIME_FORMAT, PDF_OPTIONS, PUPPETEER_OPTIONS, TEMPLATE_LOC} from '../common/constants.js'
import {sendEmail} from '../libraries/email/index.js'
import * as storage from '../libraries/storage/index.js'
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
  email: {defaultFromEmail, defaultFromName, siteUrl},
} = config

// #region Functions
const compileEmail = (template: string) =>
  handlebars.compile(fs.readFileSync(path.join(path.resolve(), TEMPLATE_LOC, `${template}.hbs`), 'utf8'))

const getReplyToList = (replyTo: string | undefined): string[] => uniq(replyTo?.split(',').map(x => x) || [])

const formatDates = email => ({
  ...email,
  dateCreated: dayjs(email.dateCreated).format(DATE_TIME_FORMAT),
  originalInstallDate: email.originalInstallDate ? dayjs(email.originalInstallDate).format(DATE_FORMAT) : undefined,
  inspectionRepairDate: email.inspectionRepairDate ? dayjs(email.inspectionRepairDate).format(DATE_FORMAT) : undefined,
  dateOfRequest: email.dateOfRequest ? dayjs(email.dateOfRequest).format(DATE_FORMAT) : undefined,
})

// #region Emails
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
const handle = async ({filename, emailType}: SendEmailMessage) => {
  const response = await storage.getObject({bucket: config.aws.sqsBucket, filename: filename})
  const contents = await response.transformToString()
  const emailMessage: AnyEmail = JSON.parse(contents)

  await handlers[emailType](emailMessage)

  return emailType
}

export default {handle}
