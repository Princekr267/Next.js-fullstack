import { getSessionCookie } from "better-auth/cookies";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user.model";
import { Message } from "@/model/user.model";

export async function POST(request: Request){
    await dbConnect()

    const {username, content} = await request.json()
    try{
        const user = await UserModel.findOne({username})
        if(!user) {
            return Response.json({
                success: false,
                message: "User not found"
            },{
                status: 404
            })
        }
        if(!user.isAcceptingMessage){
            return Response.json({
                success: false,
                message: "User is not accepting messages"
            },{
                status: 403
            })
        }

        const newMessage = {content, createdAt: new Date()}
        user.message.push(newMessage as Message)
        await user.save()

        return Response.json({
            success: true,
            message: "message sent successfully"
        },{
            status: 200
        })
    } catch(err){
        console.log("Error adding messages: ", err)
        return Response.json({
                success: false,
                message: "Internal server error"
            },{
                status: 500
            })
    }
}
