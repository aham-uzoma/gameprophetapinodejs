const express = require('express')
const router = express.Router()
const paymentsController = require('../controller/PaymentsController')


router.route('/')
      .get(paymentsController.handleGetAllPlans)
      .post(paymentsController.initializeSubscriptionWithPlan)
router.route('/:email')
      .get(paymentsController.handleGetSubscription)
// router.route('/:email')
//       .get(paymentsController.handleUpdateUserSubscriptionStatus)
router.route('/webhooks')
      .post(paymentsController.handleWebhooks)
router.route('/cancelSubscription')
      .post(paymentsController.handleCancelSubscription)
router.route('/createCustomer')
      .post(paymentsController.handleCreateCustomer)

      
module.exports = router