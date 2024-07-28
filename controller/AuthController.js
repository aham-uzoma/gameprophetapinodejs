const User = require('../model/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const handleUserLogIn =async(req, res)=>{

    const {email, password} = req.body

    if(!email || !password){
        return res.status(400).json({message:'Incorrect email or password'})
    }

    const foundUser = await User.findOne({email}).exec()


    if(!foundUser){
        return res.sendStatus(401)//unauthorized
    }
    
    const validPassword = await bcrypt.compare(password, foundUser.password)

    if(!validPassword){
        return res.sendStatus(401)//unauthorized
    }else{
        //create jwt
        const roles = Object.values(foundUser.roles)
        console.log('ROLES:', roles)

        const username = foundUser.username 
        const favouriteTeam = foundUser.favouriteTeam
        const email = foundUser.email
        const isVerified = foundUser?.isVerified
        const emailToken = foundUser?.emailToken
        const subscribed = foundUser?.subscribed

        const accessToken = jwt.sign(
            { 'UserInfo':
                {
                'sub': foundUser._id,
                'roles': roles,
                'username': username,
                 'email': email,
                 'favouriteTeam':favouriteTeam,
                 'isVerified': isVerified,
                 'subscribed': subscribed
                }
            },
            process.env.ACCESS_TOKEN_SECRET,{expiresIn: '20s'})//30s
        const refreshToken = jwt.sign({'sub': foundUser._id},
            process.env.REFRESH_TOKEN_SECRET,{expiresIn: '1d'})//1d

        //save refreshToken with current user
        foundUser.refreshToken = refreshToken
        const result = await foundUser.save()

        //create a secured cookie with refreshToken

        // res.cookie('jwt', refreshToken, { httpOnly: true, maxAge: 86400000, secure: true, sameSite: 'None' })//86400000 (24 hours)30000
        
        //Changing the above cookie storage to LocalStorage because of Googles Thirdparty cookie policy.
       // localStorage.setItem('jwt', refreshToken)

        //Send accessToken to the user Upon LogIn.
       // res.json({refreshToken})
        res.json({accessToken,refreshToken})//username, roles,favouriteTeam

    }
}
module.exports = { handleUserLogIn }