import jwt from "jsonwebtoken"
import blacklistModel from "../models/blacklist.model.js";

export function authUser(req,res,next){

    const token = req.cookies.token;

    if(!token){
        return res.status(401).json({
            message: "Unauthorized",
            success: false,
            err: "No token provided"
        })
    }

    const isTokenBlackListed = blacklistModel.findOne({
        token 
    })

    if(isTokenBlackListed){
        return res.status(401).json({
            message: "Invalid Token"
        })
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        req.user = decoded

        next()
    } catch (err){
        return res.status(401).json({
            message: "Unauthorized",
            success: false,
            err: "Invalid token"
        })
    }
}