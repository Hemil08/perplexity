import nodemailer from "nodemailer"
import {google} from "googleapis"

const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
)

oAuth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
})

async function createTransport(){
    const accessToken = await oAuth2Client.getAccessToken()

    return  nodemailer.createTransport({
    service:"gmail",
    auth:{
        type:'OAuth2',
        user: process.env.GOOGLE_USER,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
        clientId: process.env.GOOGLE_CLIENT_ID,
        accessToken: accessToken.token,
    }   
    })
}

async function verifyTransport(){
    const transporter = await createTransport()
    
    try{
        await transporter.verify()
        console.log("Transporter is ready")
    } catch (err){
        console.error("Transporter failed",err)
    }
}


export async function sendEmail({ to, subject, html, text }){

    const transporter = await createTransport()

    const mailOptions = {
        from: process.env.GOOGLE_USER,
        to,
        subject,
        html,
        text
    }

    const details = await transporter.sendMail(mailOptions)
    console.log("Email sent:", details)
}

verifyTransport()