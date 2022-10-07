const express = require('express')
const helmet = require('helmet')
const cors = require('cors')({ origin: true, credentials: true })
const responseTime = require('response-time')

const app = express()
app.use(helmet())
app.use(cors)
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(responseTime({ suffix: false, digits: 0 }))

/* Middlewares */
const callLoggerMiddleware = require('./service-library/middlewares/call-logger.middleware')
const listMiddleware = require('./service-library/middlewares/list.middleware')
const errorLoggerMiddleware = require('./service-library/middlewares/error-logger.middleware')

app.use(callLoggerMiddleware)
app.use(listMiddleware)

/* Routes */
const statusRoutes = require('./routes/status.routes')
const pipelineRoutes = require('./routes/pipeline.routes')

app.use('/', statusRoutes)
app.use('/', pipelineRoutes)

app.use(errorLoggerMiddleware)

module.exports = app
