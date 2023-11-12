import { z } from "zod";

export const todoSchema = z.object({
  id: z.number(),
  text: z.string(),
  position: z.number(),
  project: z.string().nullable(),
  createdById: z.number(),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
});

export type todoData = z.infer<typeof todoSchema>;
