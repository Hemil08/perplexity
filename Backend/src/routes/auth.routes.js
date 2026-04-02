import { Router } from "express";
import { registerValidator, loginValidator } from "../validators/auth.validator.js";
import {register, verifyEmail, login, getMe, logout } from "../controllers/auth.controller.js";
import { authUser } from "../middlewares/auth.middleware.js";

const authRouter = Router()

// @route POST /api/auth/register
// @desc Register a new user
// @access Public
// @body { username, email, password }

authRouter.post("/register", registerValidator, register)

// @route GET /api/auth/verify-email
// @desc Verify user's email address
// @access Public
// @body { token}

authRouter.get('/verify-email',verifyEmail)

// @route POST /api/auth/login
// @desc login a new user
// @access Public
// @body { email, password }
authRouter.post("/login", loginValidator, login)

// @route GET /api/auth/get-me
// @desc Get current logged in user's details
// @access Private
authRouter.get("/get-me", authUser, getMe)

// @route GET /api/auth/logout
// @desc Logout current user
// @access Private
authRouter.get('/logout',authUser,logout)

export default authRouter