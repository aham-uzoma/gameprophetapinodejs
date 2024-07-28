const User = require('../model/User')
const jwt = require('jsonwebtoken')

//communicates with verifyJWT middleware anytime req is 
//interrupted to check user authorization status

const handleRefreshToken = async (req, res) =>{
    console.log('REQQQ', req)

   // const refreshToken = req.body.refreshToken
    console.log('Req.Body', req.body)
    const authHeader = req.headers.authorization || req.headers.Authorization
    if(!authHeader?.startsWith('Bearer ')) return res.sendStatus(401) //Unauthorized
    const refreshToken = authHeader.split(' ')[1]
    console.log('ReFRESSSH', refreshToken)
   // console.log('Req.Body', req.body)

       if(!refreshToken){
        return res.sendStatus(401)//unauthorized jwt
    }


    // const cookies = req.cookies
    // //Changing the above cookie storage to LocalStorage because of Googles Thirdparty cookie policy.

    // if(!cookies.jwt){
    //     return res.sendStatus(401)//unauthorized jwt
    // }
    // const refreshToken = cookies.jwt

    const foundUser2 = await User.findOne({refreshToken}).exec()

    if(!foundUser2){
        return res.sendStatus(403)//forbidden
    }

    //evaluate JWT
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET,
    (err, decoded) => {

      // console.log("decodedSub",decoded.sub)
        console.log("ERR",err)
        console.log("decoded",decoded)

      if (err || foundUser2._id.toString() !== decoded.sub) return res.sendStatus(403);//forbidden

      const roles = Object.values(foundUser2.roles)

      //another accessToken is created
      const email = foundUser2.email
      const username = foundUser2.username
      const favouriteTeam = foundUser2.favouriteTeam
      const isVerified = foundUser2?.isVerified
      const subscribed = foundUser2?.subscribed
      console.log('foundUserEmail:',email)

      const accessToken = jwt.sign(
        { 'UserInfo':
          {
          'sub': decoded.sub , // {'username':decoded.username}, 
          'roles': roles,
          'email': email,
          'username': username,
          'favouriteTeam': favouriteTeam,
          'isVerified': isVerified,
          'subscribed': subscribed
          }
          },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '40s' }
      )
      res.json({accessToken})//email, roles, username,favouriteTeam
    })
}
module.exports={
    handleRefreshToken,
}