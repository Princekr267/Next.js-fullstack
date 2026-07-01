'use client'
import axios from "axios";
import { useRouter } from "next/navigation";
import { NextRequest } from "next/server";
import React, {useState} from "react";
import { authClient } from "@/lib/auth-client";


function Signup(request: NextRequest){

    const router = useRouter();

    const [user, setUser] = useState({
    email: "",
    password: "",
    username: ""
  })

    const handleSignup = async () => {
        try{
            const response = await axios.post("/api/signup", user)
            
            console.log("Signup success", response.data);
            router.push("/sign-in");

        } catch(err:any){
            console.log("Signup failed");
        }
    }

    const handleGoogleSignUp = async () => {
        const data = await authClient.signIn.social({
            provider: "google",
        });
        console.log(data)
    };  

    return (
        <div>
            <label htmlFor="name">Username: </label>
            <input onChange={(e) => setUser({...user, username: e.target.value})} type="text" name="" id="name" placeholder="Enter Username" />
            <br />
            <label htmlFor="email">Email: </label>
            <input onChange={(e) => setUser({...user, email: e.target.value})} type="email" name="" id="email" placeholder="Enter Email" />
            <br />
            <label htmlFor="password">Password: </label>
            <input onChange={(e) => setUser({...user, password: e.target.value})} type="password" name="" id="password" placeholder="Enter Password" />
            <hr />
            <button onClick={handleSignup} >Sign Up</button>
            <hr />
            <button onClick={handleGoogleSignUp}>Sign up with google</button>
        </div>
    )
}

export default Signup
