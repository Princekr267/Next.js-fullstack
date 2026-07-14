import { auth } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user.model";
import mongoose from "mongoose";

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
    
        const userEmail = session.user.email;
        try {
            const user = await UserModel.aggregate([
                { $match: { email: userEmail } },
                { $unwind: '$message' },
                { $sort: { 'message.createdAt': -1 } },
                { $group: { _id: '$_id', messages: { $push: '$message' } } }
            ])
            if(!user || user.length === 0){
                return Response.json({
                    success: false,
                    message: "User not found"
                }, {
                    status: 404
                })
            }
            return Response.json({
                success: true,
                messages: user[0].messages
            }, {
                status: 200
            })
        } catch (error){
            console.log("An unexpected error occured: ", error)
            return Response.json({
                success: false,
                message: "Not Authenticated"
            },{
                status: 500
            })
        }

}