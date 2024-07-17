const jwt = require('jsonwebtoken')
require('dotenv').config()
const User = require('../model/User')

const verifyJWT =  (req, res, next) => {
   const authHeader = req.headers.authorization || req.headers.Authorization
    if(!authHeader?.startsWith('Bearer ')) return res.sendStatus(401) //Unauthorized
    const token = authHeader.split(' ')[1]
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
          (err, decoded) =>{

            if(err) return res.sendStatus(403)//invalid token
            req.userID = decoded.UserInfo.sub
            req.roles = decoded.UserInfo.roles
            console.log('DECODEDID:', req.userID )
            console.log('DECODEDROLES:', req.roles )
            next()
        }
    )

}

module.exports = verifyJWT