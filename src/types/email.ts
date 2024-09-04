import {S3Message} from './consumer.js'

export interface SendEmailMessage extends S3Message {
  emailType: string
}

export type AnyEmail = IInspectionReportEmail | IJobEventEmail | ITripChargeEmail

export const TEST_EMAIL = 'test' as const
export const INSPECTION_REPORT_SUBMISSION_EMAIL = 'inspection-report-submission' as const
export const INSPECTION_REPORT_APPROVED_EMAIL = 'inspection-report-approved' as const
export const INSPECTION_REPORT_REJECTED_EMAIL = 'inspection-report-rejected' as const
export const JOB_EVENT_EMAIL = 'job-event' as const
export const TRIP_CHARGE_EMAIL = 'trip-charge' as const

export type EmailType =
  | typeof TEST_EMAIL
  | typeof INSPECTION_REPORT_SUBMISSION_EMAIL
  | typeof INSPECTION_REPORT_APPROVED_EMAIL
  | typeof INSPECTION_REPORT_REJECTED_EMAIL
  | typeof JOB_EVENT_EMAIL
  | typeof TRIP_CHARGE_EMAIL

export interface IEmail {
  to: string
  replyTo?: string
}

export interface IInspectionReportEmail extends IEmail {
  id: string
  approveEmails?: string
  dateCreated: string
  dateUpdated: string
  status: string
  inspectorName: string
  originalInstallerName?: string
  customerName: string
  projectNumber: string
  originalInstallerCrewNumber?: string
  hoursToFix: number
  originalInstallDate?: string
  inspectionRepairDate: string
  problemDescription: string
  workPerformedTodayDescription: string
  futureSolutionDescription: string
  materialsNeededForFutureVisit: string
  installerError: string
  manufacturerProblem: string
  lowesProblem: string
  backChargeMaterials: string
  customerConcernRequest: string
  futureVisitNeeded: boolean
  materialsPurchased: boolean
}

export interface IJobEventEmail extends IEmail {
  id: string
  dateCreated: string
  dateUpdated: string
  supervisorName: string
  customerName: string
  jobEventType: string[]
  bustedJob: string
  crewNumber: string
  projectNumber: string
  jobEventDescription: string
  numberOfBags?: number
  uhsBranch: string
  imageUrls: string[]
  status: string
  jobEventPos: string
  materialProblem: string
  itemNumber?: string
  dyeLotNumber?: string
  productName?: string
  detailerName?: string
}

export interface ITripChargeEmail extends IEmail {
  id: string
  dateCreated: string
  dateUpdated: string
  crewNumber: string
  projectNumber: string
  customerName: string
  dateOfRequest: string
  driveTime?: string
  description?: string
}

export interface IJobEventPo {
  id: string
  poNumber: string
  amount: number
  retailOrUhs?: string
  reason: string
}
