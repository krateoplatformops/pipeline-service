const express = require('express')
const router = express.Router()

const readController = require('../controllers/read.pipeline.controller')

router.use('/', readController)

module.exports = router
