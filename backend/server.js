const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const connectDB = require("./config/db");
const AuthRouter = require("./routes/Authroutes");
const ProfileRouter = require("./routes/ProfileRoutes");
const ProgressionRouter = require("./routes/progressionRoutes");
const photoRoutes = require("./routes/photoRoutes");
const workoutRoutes = require("./routes/workoutRoues");

connectDB();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", AuthRouter);
app.use("/api/profile", ProfileRouter);
app.use("/api/progression", ProgressionRouter);
app.use("/api/photos", photoRoutes);
app.use("/api/workout", workoutRoutes);
app.listen(5000, () => {
    console.log("Server is running");
})