import express from "express";
import notesRoutes from "./routes/notes.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { config } from "./config/index.js";
import morgan from "morgan";
import cors from "cors";
import fs from "fs";
import path from "path";

const app = express();

app.use(express.urlencoded({ extended: true }));

declare global {
  namespace Express {
    interface Response {
      locals: {
        bodyCopy?: string;
      };
    }
  }
}

app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function (body) {
    if (body) {
      res.locals.bodyCopy =
        typeof body === "string" ? body : JSON.stringify(body);
    }
    return originalSend.apply(res, arguments as any);
  };

  next();
});

morgan.token("res-body", (req, res: express.Response) => {
  return res.locals.bodyCopy || "-";
});

const logFilePath = path.join("access.log");
const logStream = fs.createWriteStream(logFilePath, { flags: "a" });

const logFormat =
  ":method :url :status :res[content-length] - Response: :res-body";

// Global middleware
app.use(cors());
app.use(morgan(logFormat, { stream: logStream }));
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
