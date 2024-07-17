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

        const accessToken = jwt.sign(
            { 'UserInfo':
                {
                'sub': foundUser._id,
                'roles': roles,
                'username': username,
                 'email': email,
                 'favouriteTeam':favouriteTeam,
                 'isVerified': isVerified,
                }
            },
            process.env.ACCESS_TOKEN_SECRET,{expiresIn: '30s'})
        const refreshToken = jwt.sign({'sub': foundUser._id},
            process.env.REFRESH_TOKEN_SECRET,{expiresIn: '1d'})

        //save refreshToken with current user
        foundUser.refreshToken = refreshToken
        const result = await foundUser.save()

        //create a secured cookie with refreshToken
        res.cookie('jwt', refreshToken, { httpOnly: true, maxAge: 86400000, secure: true, sameSite: 'None' })//86400000 (24 hours)30000

        //Send accessToken to the user Upon LogIn.
        res.json({accessToken})//username, roles,favouriteTeam

    }
}
module.exports = { handleUserLogIn }