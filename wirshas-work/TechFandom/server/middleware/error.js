

function notFound(req, res, next) {
  res.status(404);
  next(new Error(`Route not found: ${req.method} ${req.originalUrl}`));
}

function errorHandler(err, req, res, next) {
  let status = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  let message = err.message || "Something went wrong on our side.";

  if (err.name === "ValidationError" && err.errors) {
    status = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(" ");
  }

  if (err.code === 11000) {
    status = 409;
    const fields = Object.keys(err.keyValue || {})
      .map((k) => `${k}="${err.keyValue[k]}"`)
      .join(", ");
    message = `Duplicate value — ${fields || "record"} already exists.`;
  }

  if (err.name === "CastError") {
    status = 400;
    message = `Invalid value for "${err.path}".`;
  }

  if (err.name === "JsonWebTokenError") {
    status = 401;
    message = "Invalid token.";
  }
  if (err.name === "TokenExpiredError") {
    status = 401;
    message = "Token expired.";
  }

  if (typeof message === "string" && message.startsWith("CORS blocked")) {
    status = 403;
  }

  if (process.env.NODE_ENV !== "production") {
    console.error("⚠️ ", status, message);
  }

  res.status(status).json({ message, ...(process.env.NODE_ENV !== "production" ? { stack: err.stack } : {}) });
}

module.exports = { notFound, errorHandler };
