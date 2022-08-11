const axios = require('axios')
const { envConstants } = require('../constants')
const uriHelpers = require('./uri.helpers')
const { logger } = require('./logger.helpers')

const getEndpoint = async (name) => {
  const url = uriHelpers.concatUrl([envConstants.SECRET_URI, 'endpoint', name])
  logger.debug(url)

  return (await axios.get(url)).data
}

module.exports = {
  getEndpoint
}
