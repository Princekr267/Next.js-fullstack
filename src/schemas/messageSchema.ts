import z from "zod";

export const MessageSchema = z.object({
    content: z
    .string()
    .min(3, {message: "Content must be at least 3 characters"})
    .max(300, {message: "Content must be no longer least of 300 characters"})
})