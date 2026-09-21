const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const AuthRouter = require("./routes/Authroutes");
const ProfileRouter = require("./routes/ProfileRoutes");
const ProgressionRouter = require("./routes/progressionRoutes");

dotenv.config();
connectDB();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", AuthRouter);
app.use("/api/profile", ProfileRouter);
app.use("/api/progression", ProgressionRouter);
app.listen(5000, () => {
    console.log("Server is running");
})