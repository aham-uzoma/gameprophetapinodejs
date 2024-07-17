const mongoose = require('mongoose')


const connectDB = async () => {
    try {
        const connectionOptions = {
            dbName: 'gameProphetApi'
            // Other options...
        };
        await mongoose.connect(process.env.DATABASE_URI, connectionOptions)
    } catch (err) {
        console.log(err)
    }
}

module.exports = connectDB