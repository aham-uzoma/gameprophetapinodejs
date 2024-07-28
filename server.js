const express = require('express')

const app = express()

const path = require('path')

const dotenv = require('dotenv')

const cookieparser = require('cookie-parser')

const mongoose = require('mongoose')

dotenv.config()

const connectDB = require('./config/dbConn')

const PORT = process.env.PORT || 3500

console.log(process.env.NODE_ENV)

const cors = require('cors')

const corsOptions = require('./config/corsOptions')

const verifyJWT = require('./middleware/verifyJWT')

connectDB() 

app.use(cors(corsOptions))

app.use(express.json())

app.use('/', express.static(path.join(__dirname, 'public')))

app.use(cookieparser())

app.use('/', require('./routes/root'))

app.use('/auth', require('./routes/AuthRoutes'))

app.use('/createNewUser', require('./routes/UserRoutes'))

app.use('/refresh', require('./routes/RefreshTokenRoutes'))

app.use('/logOut', require('./routes/LogOutRoutes'))

app.use('/getGroupedPrediction', require('./routes/PredictableRoutes'))

app.use('/predictions', require('./routes/PredictableRoutes'))

app.use('/emailVerify', require('./routes/UserRoutes'))

app.use('/getCount', require('./routes/UserRoutes'))


app.use('/getAllPlans', require('./routes/PaymentsRoutes'))

app.use('/initializeSubscription', require('./routes/PaymentsRoutes'))

app.use('/createSubscriptions', require('./routes/PaymentsRoutes'))

app.use('/getSubscriptions', require('./routes/PaymentsRoutes'))

app.use('/updatePaymentMethod', require('./routes/PaymentsRoutes'))

app.use('/webhooks', require('./routes/PaymentsRoutes'))

app.use('/cancelSubscription', require('./routes/PaymentsRoutes'))

app.use('/createCustomer', require('./routes/PaymentsRoutes'))

app.use('/verifyUserSub', require('./routes/UserRoutes'))

// app.use('/updateUserSubscriptionStatus', require('./routes/PaymentsRoutes'))

app.use(verifyJWT)

app.use('/createNewPrediction', require('./routes/PredictableRoutes'))

app.use('/updatePredictableResult', require('./routes/PredictableRoutes'))

app.use('/comment', require('./routes/UserRoutes'))

app.use('/getAllComments', require('./routes/UserRoutes'))

app.all('*', (req, res) => {
    res.status(404);
    if (req.accepts('html')) {
      res.sendFile(path.join(__dirname, 'views', '404.html'))
    } else if (req.accepts('json')) {
      res.json({ message: '404 page not found' })
    } else {
      res.type('txt').send('404 Not Found')
    }
  });

  mongoose.connection.once('open', () => {
    console.log('connected to MongoDB')
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
  
  })

// app.listen(PORT, ()=>console.log(`Server running on port ${PORT}`))