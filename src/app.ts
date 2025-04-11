import express from "express";
import { Request, Response } from "express";
import { sequelize } from "./config/database";
import identify from "./controllers/identify";
import Contact from "./models/Contact";

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Database connection
async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    await Contact.sync({ alter: true }); // Sync model with database
    console.log("Database connection established successfully");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
  }
}

// Routes
app.post("/identify", identify);

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

// Start server
async function startServer() {
  await initializeDatabase();
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer();
