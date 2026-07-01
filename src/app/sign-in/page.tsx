'use client'
import { useRouter } from "next/navigation";
import React, {useState} from "react";
import { authClient } from "@/lib/auth-client";

function Signin(){

    const router = useRouter();

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleSignin = async () => {

        const { data, error } = await authClient.signIn.email({
            email, // required
            password, // required
            rememberMe: true,
            callbackURL: "/dashboard",

        }, {
            onRequest: (ctx) => {
                console.log("Making Request")
            },
            onSuccess(ctx) {
                router.push("/dashboard")
            },
            onError(ctx){
                console.log("Error", ctx)
            }
        });
        console.log(data);
    }

    const handleGoogleSignIn = async () => {
        const data = await authClient.signIn.social({
            provider: "google",
        });
        console.log(data)
    };

    return (
        <div>
            <label htmlFor="email">Email: </label>
            <input onChange={(e) => setEmail(e.target.value)} type="email" name="" id="email" placeholder="Enter Email" />
            <br />
            <label htmlFor="password">Password: </label>
            <input onChange={(e) => setPassword(e.target.value)} type="password" name="" id="password" placeholder="Enter Password" />
            <hr />
            <button onClick={handleSignin} >Sign In</button>
            <hr />
            <button onClick={handleGoogleSignIn}>Sign In by Google</button>
        </div>
    )
}

export default Signin
