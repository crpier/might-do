import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { todos } from "~/server/db/schema";

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

  getTodos: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.todos.findMany();
  }),

  updateTodos: protectedProcedure
    .input(z.array(z.object({ id: z.number() })))
    .mutation(async ({ ctx }) => {}),
});
