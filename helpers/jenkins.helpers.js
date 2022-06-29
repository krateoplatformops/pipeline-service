const axios = require('axios')
const uriHelpers = require('./uri.helpers')
const timeHelpers = require('./time.helpers')
const stringHelpers = require('./string.helpers')
const { logger } = require('./logger.helpers')

const readBuildHistory = async (endpoint, name) => {
  const regex = /(?<=\[)[^\]\[]*(?=])/gm
  const jobs = name.match(regex)
  const nm = name.split(']')

  const baseUrl = uriHelpers.concatUrl([
    endpoint.target,
    ...jobs.map((x) => `job/${x}`),
    'job',
    nm[nm.length - 1].trim()
  ])
  let url = uriHelpers.concatUrl([baseUrl, 'api/json?tree=allBuilds[*]'])

  logger.debug(baseUrl)
  logger.debug(url)

  const token = endpoint.secret.find((x) => x.key === 'token')
  const username = endpoint.secret.find((x) => x.key === 'username')

  const history = await axios.get(url, {
    headers: {
      Authorization: `Basic ${stringHelpers.to64(
        username.val + ':' + token.val
      )}`
    }
  })

  logger.debug(
    `Authorization: ${stringHelpers.to64(username.val + ':' + token.val)}`
  )

  return {
    pipeline: {
      id: name,
      name: nm[nm.length - 1].trim(),
      icon: 'fa-brands fa-jenkins',
      link: baseUrl
    },
    runs: history.data.allBuilds.slice(0, 10).map((r) => ({
      id: r.id,
      branch: r.displayName,
      url: r.url,
      status: r.result.toLowerCase(),
      time: timeHelpers.fromDateToEpoch(r.timestamp),
      message: r.fullDisplayName,
      duration: parseInt(r.duration / 1000)
    }))
  }
}

module.exports = {
  readBuildHistory
}
