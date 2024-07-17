const express = require('express')
const router = express.Router()
const refreshTokenContoller = require('../controller/RefreshTokenController')

router.get('/',refreshTokenContoller.handleRefreshToken)

module.exports = router;