import express from "express"
import cors from "cors"
import authRouter from "./routes/authRoutes"
import dotenv from "dotenv"
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose"

import movieRoutes from './routes/movieRoutes';
import bookingRoutes from './routes/bookingRoutes';
import hallRoutes from './routes/hallRoutes';
import showtimeRoutes from './routes/showtimeRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import feedbackRoutes from "./routes/feedbackRoutes"
import userRoutes from './routes/userRoutes';
import reportRoutes from './routes/reportRoutes';
import adminRoutes from './routes/adminRoutes';
import { notFound, errorHandler } from './middleware/errorMiddleware';
dotenv.config()

const SERVER_PORT = process.env.SERVER_PORT
const MONGO_URI = process.env.MONGO_URI as string

const app = express()

app.use(express.json())
app.use(
  cors({
    origin: ["http://localhost:5173" ],
    methods: ["GET", "POST", "PUT", "DELETE"]
  })
)

app.use("/api/v1/auth", authRouter)
app.get("/", (req, res) => {
  res.send("Backend is Running")
})



app.use("/api/v1/auth", authRouter);
app.use("/api/v1/movies", movieRoutes);


app.use("/api/v1/bookings", bookingRoutes);


app.use("/api/v1/halls", hallRoutes);


app.use("/api/v1/showtimes", showtimeRoutes);



app.use("/api/v1/users", userRoutes);



app.use("/api/v1/feedback", feedbackRoutes);


// app.use("/api/v1/admin", dashboardRoutes);


app.use("/api/v1/admin", adminRoutes);


app.use('/api/reports', reportRoutes);


app.use('/api/bookings', bookingRoutes)

app.use(notFound);
app.use(errorHandler);


app.use((req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Route Not Found - ${req.originalUrl}`);
  res.status(404);
  res.json({
    message: error.message,
    stack: process.env.NODE_ENV === 'production' ? null : error.stack,
  });
});
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("DB connected")
  })
  .catch((err) => {
    console.error(`DB connection fail: ${err}`)
    process.exit(1)
  })

app.listen(SERVER_PORT, () => {
  console.log(`Server is running on ${SERVER_PORT}`)
})
