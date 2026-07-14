'use client'
import { authClient } from "@/lib/auth-client";
import { Message } from "@/model/user.model";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {toast} from "sonner"

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AcceptMessageSchema } from "@/schemas/acceptMessageSchema";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/API_Response";
import { Button } from "@/components/ui/button";
import { Switch } from "@base-ui/react/switch";
import { Separator } from "@/components/ui/separator";
import { Loader2, RefreshCcw } from "lucide-react";
import MessageCard from "@/components/MessageCard";


export default function Dashboard() {
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSwitchLoading, setIsSwitchLoading] = useState(false)

  const handleDeleteMessage = (messageId: string) => {
    setMessages((currentMessages) =>
      currentMessages.filter((message) => message._id.toString() !== messageId)
    )
  }

  const {data: session} = authClient.useSession()

  const form = useForm<{ acceptMessages: boolean }>({
    resolver: zodResolver(AcceptMessageSchema),
    defaultValues: {
      acceptMessages: false,
    },
  })

  const {watch, setValue} = form;

  const acceptMessages = watch('acceptMessages') ?? false

  const fetchAcceptMessage = useCallback(async() => {
    setIsSwitchLoading(true)
    try {
      const response = await axios.get<ApiResponse>('/api/accept-messages')
      setValue('acceptMessages', response.data.isAcceptingMessages ?? false)
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast.error("Error", {
        description: axiosError.response?.data.message || "Failed to fetch message settings",
      })
    } finally {
      setIsSwitchLoading(false)
    }
  }, [setValue])

  const fetchMessages = useCallback(async(refresh: boolean = false) => {
    setIsLoading(true)
    setIsSwitchLoading(false)
    try{
      const response = await axios.post<ApiResponse>('/api/get-messages')
      setMessages(response.data.messages || [])
      if(refresh) {
        toast.success("Refreshed Messages", {
          description: "Showing latest messages",
        })
      }
    } catch(error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error("Error", {
        description: axiosError.response?.data.message || "Failed to fetch message settings",
      })
    } finally {
      setIsLoading(false)
    }
  }, [setIsLoading, setMessages])

  useEffect(() => {
    if(!session || !session.user) return
    fetchMessages()
    fetchAcceptMessage()
  }, [session, setValue, fetchAcceptMessage, fetchMessages])

  //handle switch change
  const handleSwitchChange = async() => {
    try {
       const response = await axios.post<ApiResponse>('/api/accept-messages', {
        acceptMessages: !acceptMessages
      })
      setValue('acceptMessages', !acceptMessages)
      toast.success(response.data.message)
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error("Error", {
        description: axiosError.response?.data.message || "Failed to fetch message settings",
      })
    }
  }

  if(!session || !session.user) {
    return <div>Please Login</div>
  }

  const username = session.user.name
  const baseUrl = `${window.location.protocol}//${window.location.host}`
  const profileUrl = `${baseUrl}/u/${username}`

  const copyToClipboart = () => {
    navigator.clipboard.writeText(profileUrl)
    toast.success("URL copied", {
      description: "Profile URL has been copied to clipboard",
    })
  }

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/sign-in"); // redirect after sign out
        },
        onError(ctx) {
          console.error("Sign out error:", ctx.error);
        }
      }
    });
  };

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl" >
      <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy your Unique Link</h2>{' '}
        <div className="flex items-center">
          <input 
            type="text"
            value={profileUrl}
            disabled
            className="input input-bordered w-full p-2 mr-2"   
          />
          <Button onClick={copyToClipboart}>Copy</Button>
        </div>
      </div>
      <div className="mb-4">
        <label className="flex items-center gap-2">
          <Switch.Root
            checked={acceptMessages}
            onCheckedChange={handleSwitchChange}
            disabled={isSwitchLoading}
            className="inline-flex h-6 w-11 items-center rounded-full bg-neutral-300 p-1 transition-colors data-checked:bg-neutral-900"
          >
            <Switch.Thumb className="h-4 w-4 rounded-full bg-white transition-transform data-checked:translate-x-5" />
          </Switch.Root>
          <span>
            Accept Messages: {acceptMessages ? 'On' : 'Off'}
          </span>
        </label>
      </div>
      <Separator />

      <Button
        className="mt-4"
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          fetchMessages(true)
        }}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCcw className="h-4 w-4" />
        )}
      </Button>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <MessageCard
              key={message._id.toString()}
              message={message}
              onMessageDelete={handleDeleteMessage}
            />
          ))
        ) : (
          <p>No messages to display.</p>
        )}

      </div>
    </div>
  );
}
