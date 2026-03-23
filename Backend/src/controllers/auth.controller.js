import userModel from "../models/user.model.js"
import jwt from "jsonwebtoken"
import { sendEmail } from "../services/mail.service.js"

// @desc Register a new User
// @route POST /api/auth/register
// @access Public
// @body {username, email, password}

export async function register(req, res){


    const {username,email,password} = req.body

    const isUserAlreadyExists = await userModel.findOne({
        $or: [ {email}, {username} ]
    })

    if(isUserAlreadyExists){
        return res.status(400).json({
            message: "User with this email or username already exists",
            success: false,
            err: "User already exists"
        })
    }

    const user = await userModel.create({username, email, password })

    const emailverificationToken = jwt.sign({
        email: user.email,
    },process.env.JWT_SECRET)

    await sendEmail({
        to:email,
        subject:"Welcome to Perplexity!",
        html: `<p>Hi ${username},</p>
            <p>Thank you for registering at Perplexity ,We're excited to have you on board</p>
            <p>Please verify your email address by clicking the link below:</p>
            <a href="http://localhost:5173/verify-email?token=${emailverificationToken}">Verify Email</a>
            <p>Best Regards,<br>The Perplexity team</p>`
    })

    res.status(201).json({
        message: "User registered successfully, please check your mail",
        success: true,
        user:{
            id:user._id,
            username: user.username,
            email: user.email 
        }
    })

}

// @desc Verify user's email address
// @route GET /api/auth/verify-email
// @access Public
// @query { token } 

export async function verifyEmail(req,res){
    const {token} = req.query

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
        const user = await userModel.findOne({ email:decoded.email })

        if(!user){
            return res.status(400).json({
                message:"Invalid token",
                success: false, 
                err: "User not found"
            })
        }

        if (user.verified === true){

            return res.status(200).json({
                message: "Email has been already verified.",
                success: true,
            })
            // const html = `
            //         <h1>Email has been already verified.</h1>
            //         <p>Your email has been already verified. Please log in to your account.</p>
            //         <a href="http://localhost:3000/api/auth/login">Go to Login</a>
            //     `
        } else{
            user.verified = true
            await user.save()

            return res.status(200).json({
                message: "Email has been verified Successfully!",
                success:true,
            })
        }

    } catch(err){
        return res.status(400).json({
            message: "Invalid or expired token",
            success: false,
            err: err.message
        })
    } 

}

// @desc login user and return JWT token
// @route POST /api/auth/login
// @access Public
// @body {email, password}

export async function login(req,res){
    const { email, password } = req.body

    const user = await userModel.findOne({ email })

    if(!user){
        return res.status(400).json({
            message: "Invalid email or password",
            success: false,
            err: "User not found"
        })
    }

    const isPasswordMatch = await user.comparePassword(password)

    if(!isPasswordMatch){
        return res.status(400).json({
            message:"Invalid email or password",
            success: false,
            err: "Incorrect password"
        })
    }

    if(!user.verified){
        return res.status(400).json({
            message: "Please verify your email before logging in",
            success: false,
            err: "Email not verified"
        })
    }

    const token = jwt.sign({
        id: user._id,
        username: user.username,
    },process.env.JWT_SECRET,{ expiresIn : "7d" })

    res.cookie("token",token)

    res.status(200).json({
        message: 'Login Successful',
        success: true,
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}

// @desc Get current logged in user's details
// @route GET /api/auth/get-me
// @access Private

export async function getMe(req,res){
    const userId = req.user.id;

    const user = await userModel.findById(userId).select("-password")

    if(!user){
        return res.status(404).json({
            message: "User not found",
            success: false,
            err: "User not found"
        })
    }

    res.status(200).json({
        message: "User details fetched successfully",
        success: true,
        user
    })
}