const User = require('../model/User')

/**
 * Handles the LogOut process and utilizing the jwt
 */

const handleLogOut = async (req, res) => {
  //delete accessToken on the client side.
  const cookies = req.cookies

  if (!cookies?.jwt) return res.sendStatus(204) //No content
  const refreshToken = cookies.jwt

  //check if refreshToken exists in the darabase.
  const foundUserData2 = await User.findOne({ refreshToken }).exec()
  if (!foundUserData2) {
    res.clearCookie('jwt', { httpOnly: true })
    return res.sendStatus(204)
  }

  //delete refreshToken from db
  foundUserData2.refreshToken = ''
  const result = foundUserData2.save()

  res.clearCookie('jwt', { httpOnly: true })
  return res.sendStatus(204)

}
module.exports = { handleLogOut }