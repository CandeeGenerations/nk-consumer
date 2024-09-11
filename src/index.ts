import express from 'express'
import fs from 'fs'
import path from 'path'

import config from './common/config'
import {startConsumer} from './consumer'

const app = express()
const port = config.port
const sep = ' -------------------------------------'
// eslint-disable-next-line no-undef
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
