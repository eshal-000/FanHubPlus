
const jwt = require('jsonwebtoken')
const User = require('../models/User')


async function protect(req, res, next) {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null

  if (!token) {
    res.status(401)
    return next(new Error('Authentication token is required'))
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    req.user = await User.findById(decoded.id)
      .select('-passwordHash')

    if (!req.user) {
      res.status(401)
      return next(new Error('Authenticated user no longer exists'))
    }

    return next()
  } catch (error) {
    res.status(401)
    return next(new Error('Invalid or expired authentication token'))
  }
}


async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null


  if (!token) {
    return next()
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    req.user = await User.findById(decoded.id)
      .select('-passwordHash')

    if (!req.user) {
      res.status(401)
      return next(new Error('Authenticated user no longer exists'))
    }

    return next()
  } catch (error) {
    res.status(401)
    return next(new Error('Invalid or expired authentication token'))
  }
}


function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403)
      return next(new Error('Insufficient permissions'))
    }

    return next()
  }
}

module.exports = {
  protect,
  optionalAuth,
  requireRole,
}
