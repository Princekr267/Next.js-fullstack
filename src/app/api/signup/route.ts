import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user.model"
import bcrypt from "bcrypt"
import { auth } from "@/lib/auth"

import { sendVerificationEmail } from "@/helpers/sendVerificationEmails";

export async function POST(request: Request){

    try{
        await dbConnect();
        const {username, email, password} = await request.json()
        let emailDeliveryFailed = false
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
                } catch(e) {
                    const err = e as { body?: { code?: string } };
                    console.log("Better Auth error:", JSON.stringify(err))
                    if (err?.body?.code !== "USER_ALREADY_EXISTS") throw e
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
                message: []
            })
            await newUser.save()
            try {
                await auth.api.signUpEmail({ body: { email, password, name: username } })
            } catch(e) {
                const err = e as { body?: { code?: string } };
                console.log("Better Auth error:", JSON.stringify(err))
                if (err?.body?.code !== "USER_ALREADY_EXISTS") throw e
            }
        }

        // send verrification email
        const emailResponse = await sendVerificationEmail(
            email,
            username,
            verifyCode
        )
        if(!emailResponse.success){
            emailDeliveryFailed = true
            console.error("Verification email failed", emailResponse.message)
        }

        return Response.json({
            success: true,
            message: emailDeliveryFailed
                ? "User registered successfully, but verification email could not be sent."
                : "User registered successfully. Please verify your email"
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
