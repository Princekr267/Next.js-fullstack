import z from "zod/v4";

export const AcceptMessageSchema = z.object({
    acceptMessages: z.boolean()
})