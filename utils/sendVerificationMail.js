const { createMailTransporter } = require("./createMailTransporter")

const sendVerificationMail =(user)=>{
  const transporter = createMailTransporter()

  const mailOptions = {
    from:'"Game-Prophet"<uzoinvent@outlook.com>',
    to:user.email,
    subject:'verify your email....',
    html:`<p>Hello ${user.username} verify your email by clicking this link...</p>
    <a href='${process.env.CLIENT_URL}/verifyEmail?emailToken=${user.emailToken}'>Verify your Email</a>`

  }

  transporter.sendMail(mailOptions, (error, info)=>{
    if(error){
        console.log(error)
    }else{
        console.log('Verification Email sent')
    }
  })
}

module.exports = {sendVerificationMail}