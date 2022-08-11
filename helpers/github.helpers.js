const axios = require('axios')
const uriHelpers = require('./uri.helpers')
const timeHelpers = require('./time.helpers')

const readActionsByName = async (endpoint, pipelines) => {
  const token = endpoint.data.find((x) => x.key === 'token')
  const headers = {
    Authorization: `token ${token.val}`
  }

  const regex = /(?<=\[)[^\]\[]*(?=])/gm

  return await Promise.all(
    pipelines.split(',').map(async (p) => {
      const scopes = p.match(regex)
      let name = p.split(']')
      name = name[name.length - 1].trim()

      const wUrl = uriHelpers.concatUrl([
        endpoint.target,
        'repos/',
        scopes[0],
        scopes[1],
        'actions/workflows'
      ])

      const workflows = await axios.get(wUrl, {
        headers
      })

      const workflow = workflows.data.workflows.find((w) => w.name === name)

      const rUrl = uriHelpers.concatUrl([
        endpoint.target,
        'repos/',
        scopes[0],
        scopes[1],
        'actions/workflows',
        workflow.id,
        'runs?per_page=10'
      ])
      const runs = await axios.get(rUrl, {
        headers
      })

      return {
        pipeline: {
          id: workflow.id,
          name: workflow.name,
          icon: 'fa-brands fa-github',
          link: workflow.html_url
        },
        runs: runs.data.workflow_runs.map((r) => ({
          id: r.id,
          branch: r.head_branch,
          url: r.html_url,
          status: r.conclusion || r.status,
          time: timeHelpers.fromDateToEpoch(r.created_at),
          message: r.head_commit.message,
          duration:
            timeHelpers.fromDateToEpoch(r.updated_at) -
            timeHelpers.fromDateToEpoch(r.created_at)
        }))
      }
    })
  )
}

module.exports = {
  readActionsByName
}
