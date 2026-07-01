import {resend} from '@/lib/resend'
import { ApiResponse } from '@/types/API_Response';
import VerificationEmail from '../../emails/verificationEmails';

export async function sendVerificationEmail(
    email: string,
    username: string,
    verifyCode: string
): Promise<ApiResponse>{
    try{
        const { data, error } = await resend.emails.send({
            from: 'Acme <onboarding@resend.dev>',
            to: [email],
            subject: 'Mystry message | Verification Code',
            react: VerificationEmail({username, otp: verifyCode}),
        });

        return {success: true, message: "Verification email sent successfully"}
    } catch(err){
        console.log("Error sending verification email", err)
        return {success: false, message: "Failed to send verification email"}
    }
}
