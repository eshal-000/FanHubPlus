const app = require('../server');
const connectDB = require('../config/db');

let connectionPromise;

module.exports = async (req, res) => {
  try {
    if (!connectionPromise) {
      connectionPromise = connectDB().catch((error) => {
        connectionPromise = null;
        throw error;
      });
    }

    await connectionPromise;
    return app(req, res);
  } catch (error) {
    console.error('Database connection failed:', error.message);

    return res.status(503).json({
      message: 'Database connection unavailable'
    });
  }
};