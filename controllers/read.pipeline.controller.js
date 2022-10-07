const express = require('express')
const router = express.Router()
const gitHubHelpers = require('../helpers/github.helpers')
const jenkinsHelpers = require('../helpers/jenkins.helpers')
const logger = require('../service-library/helpers/logger.helpers')
const secretHelpers = require('../service-library/helpers/secret.helpers')

router.get('/:endpointName/:pipelines', async (req, res, next) => {
  try {
    const endpointName = req.params.endpointName
    const pipelines = req.params.pipelines

    // get endpoint
    const endpoint = await secretHelpers.getEndpoint(endpointName)
    logger.debug(endpoint)

    if (!endpoint) {
      return res.status(404).send({ message: 'Endpoint not found' })
    }

    switch (endpoint.metadata.type) {
      case 'github':
        res.status(200).json({
          list: await gitHubHelpers.readActionsByName(endpoint, pipelines)
        })
        break
      case 'jenkins':
        res.status(200).json({
          list: await jenkinsHelpers.readBuildHistory(endpoint, pipelines)
        })
        break
      default:
        throw new Error(`Unsupported endpoint type ${endpoint.metadata.type}`)
    }
  } catch (error) {
    logger.debug(JSON.stringify(error, null, 2))
    next(error)
  }
})

module.exports = router
