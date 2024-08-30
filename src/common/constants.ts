import puppeteer from 'puppeteer'
import config from './config.js'

export const LOG_LEVELS = {
  ERROR: 'error',
  INFO: 'info',
  DEBUG: 'debug',
}

export const TEMPLATE_LOC = 'templates/build_production'
export const OVERRIDE_EMAIL = 'techsupport@nkinstallations.com'
export const DATE_FORMAT = 'M/D/YYYY'
export const DATE_TIME_FORMAT = `${DATE_FORMAT} h:mm A`
export const PDF_OPTIONS: puppeteer.PDFOptions = {
  format: 'A4',
  displayHeaderFooter: false,
}
export const PUPPETEER_OPTIONS: puppeteer.PuppeteerLaunchOptions = {
  headless: true,
  executablePath: config.env === 'production' ? '/usr/bin/google-chrome-stable' : undefined,
  args: ['--no-sandbox', '--headless', '--disable-gpu', '--disable-dev-shm-usage'],
}
