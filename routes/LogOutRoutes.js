const express = require('express')
const router = express.Router()
const logOutController = require('../controller/LogOutController')

router.get('/', logOutController.handleLogOut)

module.exports = router