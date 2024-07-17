const Predictable = require('../model/Predictable');
//const predictable = require('../model/Predictable')
const asyncHandler = require('express-async-handler')
const mongoose = require('mongoose');
const MongoClient = require('mongodb').MongoClient;
// const { ObjectId } = require('mongodb');

const getAllPredictions = asyncHandler(async (req, res) => {
  const predictions = await Predictable.find().lean().exec()
  if (!predictions?.length) {
    return res.status(400).json({ message: "No Such Predictions" })
  }
  res.json(predictions)
})

const getPredictionsGroupedByDay = asyncHandler(async (req, res) => {
  try {
    const allPredictions = await Predictable.find().lean().exec();
    const groupedPredictions = {};

    for (const prediction of allPredictions) {
      const timestamp = prediction.createdAt
      const dateOnly = new Date(timestamp.getFullYear(), timestamp.getMonth(), timestamp.getDate());

      // console.log('dateOnlyKey', dateOnly)

      if (!groupedPredictions[dateOnly]) {
        groupedPredictions[dateOnly] = [];
      }
      groupedPredictions[dateOnly].push(prediction)

    }
    // console.log('groupedPredictions', groupedPredictions)

    if (!groupedPredictions) {
      return res.status(400).json({ message: 'No rescent transaction' })
    }
    res.json(groupedPredictions)

  } catch (error) {
    console.error('Error fetching predictions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }

  // return groupedPredictions;
})


const createNewPrediction = asyncHandler(async (req, res) => {
  const newPredictionObj = req.body;
  const result = "Ongoing"
  for (const prediction of newPredictionObj) {
    prediction.result = result
  }
  console.log('newPredictionObj', newPredictionObj)

  if (!newPredictionObj) {
    return res.status(400).json({ message: "All fields are required" })
  }
  const addNewPrediction = await Predictable.create(newPredictionObj)
  if (addNewPrediction) {
    return res.status(201).json({ message: "New Prediction Created" })
  } else {
    return res.status(400).json({ message: "Invalid Item" })
  }
})

const updatePredictableResult = asyncHandler(async (req, res) => {
  const newPredictUpdate = req.body
  console.log('newPredictUpdate', newPredictUpdate)
  if (!newPredictUpdate) {
    return res.status(400).json({ message: "You do not have any data for Update" })
  }

  let updateSuccess = true
  newPredictUpdate.forEach(async (update) => {
    try {
      const { _id, result } = update
      const updatedResult = await Predictable.findOneAndUpdate(
        { _id: _id },
        { $set: { result } },
        { upsert: true, returnDocument: 'after' },
      )
      console.log('updatedResult', updatedResult)

      if (updatedResult) {
        updateSuccess = true
        console.log(`Updated result for _id ${_id} to ${result}`);
      } else {
        console.log(`No document updated for _id ${_id}`);
      }
    } catch (error) {
      updateSuccess = false
      console.error(`Error updating _id ${update._id}: ${error.message}`)
    }
  })
  if (updateSuccess == true) {
    return res.status(201).json({ message: "Prediction have been Updated" })
  } else {
    return res.status(400).json({ message: "An error occured while Updating" })
  }

})

module.exports = {
  getPredictionsGroupedByDay,
  createNewPrediction,
  getAllPredictions,
  updatePredictableResult
}