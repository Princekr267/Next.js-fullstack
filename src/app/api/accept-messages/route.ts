import { auth } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user.model";

export async function POST(request: Request){
    await dbConnect()

    const session = await auth.api.getSession({
        headers: request.headers,
    })

    if(!session?.user){
        return Response.json({
            success: false,
            message: "Not Authenticated",
        }, {
            status: 401
        })
    }

    const userEmail = session.user.email
    const {acceptMessages} = await request.json()

    try{
        const updatedUser = await UserModel.findOneAndUpdate({ email: userEmail }, { isAcceptingMessage: acceptMessages }, {new: true})
        if(!updatedUser) {
            return Response.json({
                success: false,
                message: "failed to update user status to aceept messages"
            }, {status: 401})
        }
        return Response.json({
                success: true,
                message: "Message acceptance status updated successfully"
            }, {status: 200})
    } catch(err){
        console.log("failed to update user status to accept messages")
        return Response.json(
            {
                success: false,
                message: "failed to update user status to accept messages"
            },
            {status: 500}
        )
    }
}

export async function GET(request: Request) {
    await dbConnect()

    const session = await auth.api.getSession({
        headers: request.headers,
    })
    
    if(!session?.user){
        return Response.json({
            success: false,
            message: "Not Authenticated",
        }, {
            status: 401
        })
    }

    const userEmail = session.user.email
   try {
        const foundUser = await UserModel.findOne({ email: userEmail })
     
        if(!foundUser) {
            return Response.json({
                success: false,
                message: "User not found"
            }, {status: 404})
        }
         
        return Response.json({
            success: true,
            isAcceptingMessages: foundUser.isAcceptingMessage
            }, {status: 200})
        }
    catch(err){
        console.log("Error in getting message acceptance status")
        return Response.json({
            success: false,
            message: "Error in getting message acceptance status"
        }, {status: 500})
    }
}