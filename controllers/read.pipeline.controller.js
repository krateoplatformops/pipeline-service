const express = require('express')
const router = express.Router()
const uriHelpers = require('../helpers/uri.helpers')
const gitHubHelpers = require('../helpers/github.helpers')
const stringHelpers = require('../helpers/string.helpers')
const { logger } = require('../helpers/logger.helpers')

router.get('/pipeline/:url/:endpoint/:name', async (req, res, next) => {
  try {
    const parsed = uriHelpers.parse(stringHelpers.b64toAscii(req.params.url))

    const endpoint = JSON.parse(stringHelpers.b64toAscii(req.params.endpoint))

    logger.debug(endpoint)

    switch (endpoint?.type) {
      case 'github':
        const content = await gitHubHelpers.readActionsByName(
          endpoint,
          parsed,
          stringHelpers.b64toAscii(req.params.name)
        )
        res.status(200).json({
          content: content
        })
        break
      default:
        throw new Error(`Unsupported endpoint ${parsed.domain}`)
    }
  } catch (error) {
    next(error)
  }
})

module.exports = router
