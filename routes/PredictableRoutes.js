const express = require('express')
const router = express.Router()
const predictableController = require('../controller/PredictableController')
const ROLES_LIST = require('../config/roles_List')
const verifyRoless = require('../middleware/verifyRoless')

router.route('/')
      .get(predictableController.getPredictionsGroupedByDay)
      .post(verifyRoless(ROLES_LIST.Admin, ROLES_LIST.SuperAdmin),predictableController.createNewPrediction)
      .put(verifyRoless(ROLES_LIST.Admin, ROLES_LIST.SuperAdmin),predictableController.updatePredictableResult)
router.route('/all')
      .get(predictableController.getAllPredictions)
      
module.exports = router