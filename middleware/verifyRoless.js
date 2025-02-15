const verifyRoless = (...allowedRoles) =>{
    return (req, res, next) =>{
        console.log('REQ.ROLES:', req?.roles)
        if(!req?.roles) return res.sendStatus(401)//unauthorized
        const rolesArray = [...allowedRoles]
        console.log('rolesArray:',rolesArray)
        console.log(req.roles)
        const result = req.roles.map(role=> rolesArray.includes(role)).find(val => val === true)
        if(!result) return res.sendStatus(401)
        next()
    }
}

module.exports = verifyRoless 