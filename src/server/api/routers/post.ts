import { eq } from "drizzle-orm";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { todos } from "~/server/db/schema";
import { todoSchema } from "~/utils/types";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  // create: protectedProcedure
  //   .input(z.object({ name: z.string().min(1) }))
  //   .mutation(async ({ ctx, input }) => {
  //     // simulate a slow db call
  //     await new Promise((resolve) => setTimeout(resolve, 1000));
  //
  //     await ctx.db.insert(posts).values({
  //       name: input.name,
  //       createdById: ctx.session.user.id,
  //     });
  //   }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),

  getTodos: protectedProcedure.query(async ({ ctx }) => {
    const res = await ctx.db.query.todos.findMany();
    return res.map((todo) => todoSchema.parse(todo));
  }),

  updateTodosOrder: protectedProcedure
    .input(z.array(todoSchema))
    .mutation(({ ctx, input }) => {
      console.log(input[0])
      input.map(async (todo) => {
        await ctx.db
          .update(todos)
          .set({ position: todo.position })
          .where(eq(todos.id, todo.id));
      });
    }),
});
