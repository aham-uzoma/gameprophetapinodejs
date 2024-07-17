const express = require('express')
const router = express.Router()
const authController = require('../controller/AuthController')

router.route('/')
      .post(authController.handleUserLogIn)

module.exports = router