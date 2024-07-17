const mongoose = require ('mongoose')

const predictableSchema = new mongoose.Schema(

    {
        game : {
            type: String,
        //    required: true,
        },
        odds :{
            type: String,
            // required: true,
        },
        vip :{
            type: String,
        //    required: true,
        },
        regular :{
            type: String,
        //    required: true,
        },
        result :{
            type: String,
        //    required: true,
        },
        timeStamp:{
            type: Date
        }
    },
    {
        timestamps: true
    }
    // {
    //     collection: 'predictables'
    // },
   

) 
module.exports = mongoose.model('Predictable', predictableSchema, 'predictables')
//const Book = mongoose.model('Book', bookSchema);
