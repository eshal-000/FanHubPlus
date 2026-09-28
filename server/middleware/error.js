function notFound(req, res, next) {
  res.status(404)
  next(new Error(`Not Found - ${req.originalUrl}`))
}

function errorHandler(err, req, res, next) {
  const statusCode = res.statusCode === 200 ? err.statusCode || 500 : res.statusCode

  console.error(`[ERROR] ${statusCode} - ${err.message}`)
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack)
  }

  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  })
}

module.exports = { notFound, errorHandler }
