import express from 'express'
import fs from 'fs'
import path from 'path'
import {fileURLToPath} from 'url'
import config from './common/config.js'
import {startConsumer} from './consumer.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const app = express()
const port = config.port
const sep = ' -------------------------------------'
const pjson = JSON.parse(fs.readFileSync(path.join(__dirname, '../', 'package.json'), 'utf8'))

app.use(express.json())

console.log(`
   _____    _____
  / ____|  / ____|
 | |      | |  __  ___ _ __
 | |      | | |_ |/ _ \\ '_ \\
 | |____  | |__| |  __/ | | |
  \\_____|  \\_____|\\___|_| |_|

${sep}
 NK Consumer | v${pjson.version || '_dev'}
 🚀 Server ready on PORT: ${port}
${sep}`)

app.listen(port)

startConsumer()
