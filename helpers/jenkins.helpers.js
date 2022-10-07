const axios = require('axios')
const uriHelpers = require('../service-library/helpers/uri.helpers')
const timeHelpers = require('../service-library/helpers/time.helpers')
const stringHelpers = require('../service-library/helpers/string.helpers')
const { logger } = require('../service-library/helpers/logger.helpers')

const readBuildHistory = async (endpoint, pipelines) => {
  const token = endpoint.data.token
  const username = endpoint.data.username
  const headers = {
    Authorization: `Basic ${stringHelpers.to64(username + ':' + token)}`
  }
  logger.debug(headers)

  const regex = /(?<=\[)[^\]\[]*(?=])/gm

  return await Promise.all(
    pipelines.split(',').map(async (p) => {
      const jobs = p.match(regex)
      let name = p.split(']')
      name = name[name.length - 1].trim()

      const baseUrl = uriHelpers.concatUrl([
        endpoint.target,
        ...jobs.map((x) => `job/${encodeURIComponent(x)}`),
        'job',
        encodeURIComponent(name)
      ])
      let url = uriHelpers.concatUrl([baseUrl, 'api/json?tree=allBuilds[*]'])

      logger.debug(url)

      const history = await axios.get(url, {
        headers
      })

      return {
        pipeline: {
          id: name,
          name,
          icon: 'fa-brands fa-jenkins',
          link: baseUrl
        },
        runs: history.data.allBuilds.slice(0, 10).map((r) => ({
          id: r.id,
          branch: r.displayName,
          url: r.url,
          status: (r.result || 'unknown').toLowerCase(),
          time: timeHelpers.fromDateToEpoch(r.timestamp),
          message: r.fullDisplayName,
          duration: parseInt(r.duration / 1000)
        }))
      }
    })
  )
}

module.exports = {
  readBuildHistory
}
