const express = require("express");
const { register, login, getMe } = require("../controllers/Authcontroller");
const authMiddleware = require("../middleware/Authmiddleware")
const Router = express.Router();

Router.post("/register", register);
Router.post("/login", login);
Router.get("/me", authMiddleware, getMe);

module.exports = Router;