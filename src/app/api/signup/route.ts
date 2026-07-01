import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user.model"
import bcrypt from "bcrypt"
import { auth } from "@/lib/auth"

import { sendVerificationEmail } from "@/helpers/sendVerificationEmails";

export async function POST(request: Request){

    try{
        await dbConnect();
        const {username, email, password} = await request.json()
        const existingUserVerifiedByUsername = await UserModel.findOne({
            username,
            isVerified: true
        })

        if(existingUserVerifiedByUsername) {
            return Response.json({
                success: false,
                message: "Username is already taken"
            }, {status: 400})
        }

        const existingUserByEmail = await UserModel.findOne({email})
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString()

        if(existingUserByEmail) {
            if(existingUserByEmail.isVerified){
                return Response.json({
                    success: false,
                    message: "User already exist with this email"
                }, {status: 400})
            } else {
                const hashedPassword = await bcrypt.hash(password, 10)
                existingUserByEmail.password = hashedPassword;
                existingUserByEmail.verifyCode = verifyCode;
                existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000)
                await existingUserByEmail.save()
                try {
                    await auth.api.signUpEmail({ body: { email, password, name: username } })
                } catch(e: any) {
                    console.log("Better Auth error:", JSON.stringify(e))
                    if (e?.body?.code !== "USER_ALREADY_EXISTS") throw e
                }
            }
        } else {
            const hashedPassword = await bcrypt.hash(password, 10)
            const expiryDate = new Date()
            expiryDate.setHours(expiryDate.getHours()+1)
            
            const newUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessage: true,
                messages: []
            })
            await newUser.save()
            try {
                await auth.api.signUpEmail({ body: { email, password, name: username } })
            } catch(e: any) {
                console.log("Better Auth error:", JSON.stringify(e))
                if (e?.body?.code !== "USER_ALREADY_EXISTS") throw e
            }
        }

        // send verrification email
        const emailResponse = await sendVerificationEmail(
            email,
            username,
            verifyCode
        )
        if(!emailResponse.success){
            return Response.json({
                success: false,
                message: emailResponse.message
            }, {status: 500})
        }

        return Response.json({
            success: true,
            message: "User registered successfully. Please verify your email"
        }, {status: 201})

    } catch(err){
        console.error('Error registering user', err)
        return Response.json({
            success: false,
            message: "Error registering user"
        }, {
            status: 500
        })
    }
}
