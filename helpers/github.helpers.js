const axios = require('axios')
const uriHelpers = require('./uri.helpers')
const timeHelpers = require('./time.helpers')

const readActionsByName = async (endpoint, parsed, name) => {
  const wUrl = uriHelpers.concatUrl([
    endpoint.target,
    'repos/',
    parsed.pathList[0],
    parsed.pathList[1],
    'actions/workflows'
  ])

  const token = endpoint.secret.find((x) => x.key === 'token')

  const workflows = await axios.get(wUrl, {
    headers: {
      Authorization: `token ${token.val}`
    }
  })

  const workflow = workflows.data.workflows.find((w) => w.name === name)

  if (!workflow) {
    throw new Error(`Workflow "${name}" not found`)
  }

  const rUrl = uriHelpers.concatUrl([
    endpoint.target,
    'repos/',
    parsed.pathList[0],
    parsed.pathList[1],
    'actions/workflows',
    workflow.id,
    'runs?per_page=10'
  ])

  const runs = await axios.get(rUrl, {
    headers: {
      Authorization: `token ${token.val}`
    }
  })

  return {
    pipeline: {
      id: workflow.id,
      name: workflow.name,
      icon: 'fa-brands fa-github',
      repository: uriHelpers.concatUrl([
        'https://',
        parsed.domain,
        parsed.pathList[0],
        parsed.pathList[1]
      ])
    },
    runs: runs.data.workflow_runs.map((r) => ({
      id: r.id,
      branch: r.head_branch,
      url: r.html_url,
      status: r.conclusion || r.status,
      time: timeHelpers.fromDateToEpoch(r.created_at),
      message: r.head_commit.message
    }))
  }
}

module.exports = {
  readActionsByName
}
