require("dotenv").config();

const express = require("express");
const cors = require("cors");
const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/error");

const app = express();

const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/", (_req, res) => {
  res.json({ name: "Fan Hub Plus API", status: "ok", time: new Date().toISOString() });
});
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/profile", require("./routes/profileRoutes"));
app.use("/api/bookmarks", require("./routes/bookmarkRoutes"));
app.use("/api/characters", require("./routes/characterRoutes"));
app.use("/api/articles", require("./routes/articleRoutes"));
app.use("/api/content", require("./routes/contentRoutes"));
app.use("/api/media", require("./routes/mediaRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/releases", require("./routes/releaseRoutes"));
app.use("/api/merch", require("./routes/merchRoutes"));
app.use("/api/submissions", require("./routes/submissionRoutes"));
app.use("/api/feedback", require("./routes/feedbackRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

(async () => {
  await connectDB();
  const server = app.listen(PORT, () =>
    console.log(`🚀 Fan Hub Plus API listening on http://localhost:${PORT}`)
  );

  const shutdown = (signal) => {
    console.log(`\n${signal} received — closing server…`);
    server.close(() => {
      require("mongoose").connection.close(false);
      console.log("MongoDB connection closed. Bye 👋");
      process.exit(0);
    });
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
})();