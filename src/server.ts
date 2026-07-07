import express from "express";
import notesRoutes from "./routes/notes.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { config } from "./config/index.js";
import morgan from "morgan";
import cors from "cors";
import fs from "fs";
import path from "path";
const app = express();

// Global middleware
app.use(cors());

// Parse request bodies first
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Fixed the middleware interceptor to stream data seamlessly without blanking out responses
// app.use((req, res, next) => {
//   const originalSend = res.send;

//   res.send = function (body) {
//     if (body !== undefined && body !== null) {
//       // Safely capture and convert the body string/object for Morgan logs
//       (res.locals as any).bodyCopy =
//         typeof body === "string" ? body : JSON.stringify(body);
//     }
//     return originalSend.call(this, body);
//   };

//   next();
// });
morgan.token("res-body", (req, res: any) => {
  return res.locals?.bodyCopy || "-";
});

const logFilePath = path.join("access.log");
const logStream = fs.createWriteStream(logFilePath, { flags: "a" });

const logFormat =
  ":method :url :status :res[content-length] - Response: :res-body";

app.use(morgan(logFormat, { stream: logStream }));

// Routes
app.use("/notes", notesRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { message: "Route not found" },
  });
});

// Error handler (must be last)
app.use(errorHandler);

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
