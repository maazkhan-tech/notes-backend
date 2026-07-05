import express from "express";
import notesRoutes from "./routes/notes.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import config from "./config/index.js";
import morgan from "morgan";
import cors from "cors";

const app = express();

// Global middleware
app.use(cors());
app.use(morgan(config.nodeEnv === "production" ? "combined" : "dev"));
app.use(express.json());

// Routes
app.use("/notes", notesRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handler (must be last)
app.use(errorHandler);

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
