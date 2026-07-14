import { auth } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user.model";

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ messageid: string }> }
){
    const { messageid: messageId } = await params
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
    
        try {
            const updateResult = await UserModel.updateOne(
                { email: session.user.email },
                { $pull: { message: { _id: messageId } } }
            )
            if(updateResult.modifiedCount == 0) {
                return Response.json({
                    success: false,
                    message: "Message not found or already deleted"
                }, {status: 404})
            }
            return Response.json({
                success: true,
                message: "Message Deleted",
            }, {status: 200})
        } catch (error) {
            console.log("Error in deleting route", error)
            return Response.json({
                success: false,
                message: "Error deleting message"
            }, {status: 500})   
        }
        

}