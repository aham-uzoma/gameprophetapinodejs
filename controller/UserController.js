const User = require('../model/User')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const { sendVerificationMail } = require('../utils/sendVerificationMail')


//create a user
const createNewUser = asyncHandler(async(req, res)=>{
  const {username, email, password, favouriteTeam} = req.body

  //confirm data
  if(!username || !email || !password || !favouriteTeam){
    return res.status(400).json({message: "All fields are required"})
  }

  //check for duplicates
  const duplicate = await User.findOne({email}).lean().exec()

  if(duplicate){
    return res.status(409).json({message: "email already exists"})
  }

  //Hash Passwords
  const hashedPassword = await bcrypt.hash(password, 10)

  const userObj = {username, password:hashedPassword, email, favouriteTeam, 
    emailToken:crypto.randomBytes(64).toString('hex') }

  const newuser  = await User.create(userObj)

  sendVerificationMail(newuser)

  if(newuser){
    console.log("newuser", newuser)

  }else{
    console.log("Still Awaiting promises")

  }

 //match the automatically generated id _id with the userID field.   

 newuser.userID = newuser._id

 const user = await newuser.save()

 if(user){
    return res.status(201).json({message: "Your account have been created"})
 }else{
    return res.status(400).json({message: "Invalid user data"})
 }

})

const getUserCount = asyncHandler(async(req, res)=>{
  const userCount = await User.countDocuments()
  console.log('Usercount:', userCount)
  return res.status(200).json({userCount})
})

const createComments = asyncHandler( async (req, res)=>{
  const {comment} = req.body//userID,
  const userID = req.userID
  
  if(!userID || !comment){

    return res.status(400).json({message: 'comment not created'})
  }

 // const findUser = await User.find({userID}).exec()

  const findUser = await User.findOneAndUpdate(
    { userID: userID },
    { $push: { comments: { content: comment } } }
  );

  if(!findUser){
    return res.status(400).json({message: 'User not found!!!'})
  }else{
    return res.status(201).json({message: "comment posted successfully !!!"})

  }
})

const getAllComments = asyncHandler(async (req, res)=>{

  // const users = await User.find().select('-password').populate('comments').lean()
  // if (!users?.length) {
  //    return res.status(400).json({ message: 'No Users Found' })
  // }

  const users = await User.find({ comments: { $ne: [] } }).populate('comments'); // Exclude users with no comments

if (!users.length) {
  return res.status(400).json({ message: 'No comments found!' });
}

//const allComments = users.flatMap(user => user.comments);

const allComments = users.flatMap(user => 
  user.comments.map(comment => ({
    username: user.username, // Access username from populated user object
    content: comment.content,
    createdAt: comment.createdAt,
  }))
);


res.status(200).json(allComments);

  //console.log('USER',users)
  // const allComments = await User.find()

})

const verifyEmail = async (req, res) =>{
  try{

    const emailToken = req.body.emailToken
    if(!emailToken) return res.status(404).json('Email Token not found....')

    const user = await User.findOne({emailToken})

    if(user){
      user.emailToken = null
      user.isVerified = true

      await user.save()

      res.status(200).json({
        _id:user._id,
        name:user.username,
        email:user.email,
        isVerified:user?.isVerified
      })
    } else res.status(404).json('Email Verification failed! invalid Token')
  }catch(error){
    console.log(error)
    res.status(500).json(error.message)
  }
}

const verifySubscription =async(req, res) =>{
  try {
    
    const {email, subscribed} = req.body//userID,
    console.log('email', email)
    console.log('subscribed', subscribed)

    if(!email) return res.status(404).json('email not found...')
      if(!subscribed) return res.status(404).json('subscription status not found...')
    const user = await User.findOne({email})

    if(user){
      user.subscribed = subscribed

      await user.save()

      res.status(200).json({
        email:user.email,
        subscribed:user?.subscribed
      })
  } else res.status(404).json('User not found!!!') 

}catch(error){
  console.log(error)
  res.status(500).json(error.message)
}
}

module.exports={
    createNewUser,
    createComments,
    getAllComments,
    verifyEmail,
    getUserCount,
    verifySubscription
}