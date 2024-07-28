const express = require('express')
const router = express.Router()
const userController = require('../controller/UserController')


router.route('/')
      .post(userController.createNewUser)
      .get(userController.getAllComments)
router.route('/comments')
      .post(userController.createComments)
router.route('/verifyMail')
      .post(userController.verifyEmail)
router.route('/userCount')
      .get(userController.getUserCount)
router.route('/verifySubs')
      .post(userController.verifySubscription)
      
module.exports = router