import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";

const curatorProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "curator" && ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Curator or admin access required" });
  }
  return next({ ctx });
});

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  users: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllUsers();
    }),
  }),

  passports: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllPassports();
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const passport = await db.getPassport(input.id);
        if (!passport) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Passport not found" });
        }
        return passport;
      }),

    create: curatorProcedure
      .input(
        z.object({
          serviceName: z.string().min(1),
          serviceCode: z.string().optional(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const id = await db.createPassport({
          ...input,
          createdBy: ctx.user.id,
        });
        return { id };
      }),

    update: curatorProcedure
      .input(
        z.object({
          id: z.number(),
          serviceName: z.string().optional(),
          serviceCode: z.string().optional(),
          description: z.string().optional(),
          status: z.enum(["draft", "in_review", "published", "archived"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updatePassport(id, data);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deletePassport(input.id);
        return { success: true };
      }),

    versions: protectedProcedure
      .input(z.object({ passportId: z.number() }))
      .query(async ({ input }) => {
        return await db.getPassportVersions(input.passportId);
      }),

    createVersion: curatorProcedure
      .input(
        z.object({
          passportId: z.number(),
          data: z.any(),
          comment: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const passport = await db.getPassport(input.passportId);
        if (!passport) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Passport not found" });
        }

        const id = await db.createPassportVersion({
          passportId: input.passportId,
          version: passport.version + 1,
          data: input.data,
          comment: input.comment,
          createdBy: ctx.user.id,
        });

        await db.updatePassport(input.passportId, { version: passport.version + 1 });

        return { id };
      }),
  }),

  sections: router({
    list: protectedProcedure
      .input(z.object({ passportId: z.number() }))
      .query(async ({ input }) => {
        return await db.getPassportSections(input.passportId);
      }),

    get: protectedProcedure
      .input(z.object({ passportId: z.number(), sectionNumber: z.number() }))
      .query(async ({ input }) => {
        return await db.getSection(input.passportId, input.sectionNumber);
      }),

    create: curatorProcedure
      .input(
        z.object({
          passportId: z.number(),
          sectionNumber: z.number(),
          sectionName: z.string(),
          curatorId: z.string().optional(),
          data: z.any().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const id = await db.createSection(input);
        return { id };
      }),

    update: curatorProcedure
      .input(
        z.object({
          id: z.number(),
          data: z.any().optional(),
          isCompleted: z.boolean().optional(),
          curatorId: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateSection(id, data);
        return { success: true };
      }),
  }),

  normativeActs: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllNormativeActs();
    }),

    create: curatorProcedure
      .input(
        z.object({
          type: z.string(),
          number: z.string(),
          date: z.date(),
          title: z.string(),
          description: z.string().optional(),
          url: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const id = await db.createNormativeAct(input);
        return { id };
      }),

    linkToPassport: curatorProcedure
      .input(
        z.object({
          passportId: z.number(),
          normativeActId: z.number(),
          sectionNumber: z.number().optional(),
          relevance: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const id = await db.linkNormativeActToPassport(input);
        return { id };
      }),

    getPassportActs: protectedProcedure
      .input(z.object({ passportId: z.number() }))
      .query(async ({ input }) => {
        return await db.getPassportNormativeActs(input.passportId);
      }),
  }),

  bpmn: router({
    list: protectedProcedure
      .input(z.object({ passportId: z.number() }))
      .query(async ({ input }) => {
        return await db.getBpmnDiagrams(input.passportId);
      }),

    create: curatorProcedure
      .input(
        z.object({
          passportId: z.number(),
          name: z.string(),
          type: z.enum(["as-is", "to-be"]),
          xmlContent: z.string(),
          svgPreview: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const id = await db.createBpmnDiagram(input);
        return { id };
      }),

    update: curatorProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          xmlContent: z.string().optional(),
          svgPreview: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateBpmnDiagram(id, data);
        return { success: true };
      }),

    delete: curatorProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteBpmnDiagram(input.id);
        return { success: true };
      }),
  }),

  criteria: router({
    list: protectedProcedure
      .input(z.object({ passportId: z.number() }))
      .query(async ({ input }) => {
        return await db.getCriteria(input.passportId);
      }),

    create: curatorProcedure
      .input(
        z.object({
          passportId: z.number(),
          criterionName: z.string(),
          criterionType: z.string(),
          description: z.string().optional(),
          dataSource: z.string().optional(),
          validationRule: z.string().optional(),
          priority: z.number().optional(),
          normativeBasis: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const id = await db.createCriterion(input);
        return { id };
      }),

    update: curatorProcedure
      .input(
        z.object({
          id: z.number(),
          criterionName: z.string().optional(),
          criterionType: z.string().optional(),
          description: z.string().optional(),
          dataSource: z.string().optional(),
          validationRule: z.string().optional(),
          priority: z.number().optional(),
          normativeBasis: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateCriterion(id, data);
        return { success: true };
      }),

    delete: curatorProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteCriterion(input.id);
        return { success: true };
      }),
  }),

  formulas: router({
    list: protectedProcedure
      .input(z.object({ passportId: z.number() }))
      .query(async ({ input }) => {
        return await db.getPaymentFormulas(input.passportId);
      }),

    create: curatorProcedure
      .input(
        z.object({
          passportId: z.number(),
          formulaName: z.string(),
          formulaExpression: z.string(),
          variables: z.any().optional(),
          roundingRule: z.string().optional(),
          examples: z.any().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const id = await db.createPaymentFormula(input);
        return { id };
      }),

    update: curatorProcedure
      .input(
        z.object({
          id: z.number(),
          formulaName: z.string().optional(),
          formulaExpression: z.string().optional(),
          variables: z.any().optional(),
          roundingRule: z.string().optional(),
          examples: z.any().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updatePaymentFormula(id, data);
        return { success: true };
      }),

    delete: curatorProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deletePaymentFormula(input.id);
        return { success: true };
      }),
  }),

  statuses: router({
    list: protectedProcedure
      .input(z.object({ passportId: z.number() }))
      .query(async ({ input }) => {
        return await db.getStatusModels(input.passportId);
      }),

    create: curatorProcedure
      .input(
        z.object({
          passportId: z.number(),
          statusCode: z.string(),
          statusName: z.string(),
          description: z.string().optional(),
          isInitial: z.boolean().optional(),
          isFinal: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const id = await db.createStatusModel(input);
        return { id };
      }),

    update: curatorProcedure
      .input(
        z.object({
          id: z.number(),
          statusCode: z.string().optional(),
          statusName: z.string().optional(),
          description: z.string().optional(),
          isInitial: z.boolean().optional(),
          isFinal: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateStatusModel(id, data);
        return { success: true };
      }),

    delete: curatorProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteStatusModel(input.id);
        return { success: true };
      }),

    transitions: protectedProcedure
      .input(z.object({ passportId: z.number() }))
      .query(async ({ input }) => {
        return await db.getStatusTransitions(input.passportId);
      }),

    createTransition: curatorProcedure
      .input(
        z.object({
          passportId: z.number(),
          fromStatusId: z.number().optional(),
          toStatusId: z.number(),
          condition: z.string().optional(),
          isAutomatic: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const id = await db.createStatusTransition(input);
        return { id };
      }),

    deleteTransition: curatorProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteStatusTransition(input.id);
        return { success: true };
      }),
  }),

  notifications: router({
    list: protectedProcedure
      .input(z.object({ passportId: z.number() }))
      .query(async ({ input }) => {
        return await db.getNotificationTemplates(input.passportId);
      }),

    create: curatorProcedure
      .input(
        z.object({
          passportId: z.number(),
          templateName: z.string(),
          channel: z.enum(["sms", "email", "push", "portal"]),
          subject: z.string().optional(),
          body: z.string(),
          variables: z.any().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const id = await db.createNotificationTemplate(input);
        return { id };
      }),

    update: curatorProcedure
      .input(
        z.object({
          id: z.number(),
          templateName: z.string().optional(),
          channel: z.enum(["sms", "email", "push", "portal"]).optional(),
          subject: z.string().optional(),
          body: z.string().optional(),
          variables: z.any().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateNotificationTemplate(id, data);
        return { success: true };
      }),

    delete: curatorProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteNotificationTemplate(input.id);
        return { success: true };
      }),
  }),

  smev: router({
    list: protectedProcedure
      .input(z.object({ passportId: z.number() }))
      .query(async ({ input }) => {
        return await db.getSmevIntegrations(input.passportId);
      }),

    create: curatorProcedure
      .input(
        z.object({
          passportId: z.number(),
          serviceName: z.string(),
          serviceCode: z.string(),
          purpose: z.string().optional(),
          requestExample: z.string().optional(),
          responseExample: z.string().optional(),
          fieldMapping: z.any().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const id = await db.createSmevIntegration(input);
        return { id };
      }),

    update: curatorProcedure
      .input(
        z.object({
          id: z.number(),
          serviceName: z.string().optional(),
          serviceCode: z.string().optional(),
          purpose: z.string().optional(),
          requestExample: z.string().optional(),
          responseExample: z.string().optional(),
          fieldMapping: z.any().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateSmevIntegration(id, data);
        return { success: true };
      }),

    delete: curatorProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteSmevIntegration(input.id);
        return { success: true };
      }),
  }),

  comments: router({
    list: protectedProcedure
      .input(z.object({ passportId: z.number(), sectionNumber: z.number().optional() }))
      .query(async ({ input }) => {
        return await db.getPassportComments(input.passportId, input.sectionNumber);
      }),

    create: protectedProcedure
      .input(
        z.object({
          passportId: z.number(),
          sectionNumber: z.number().optional(),
          commentText: z.string(),
          parentCommentId: z.number().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const id = await db.createComment({
          ...input,
          userId: ctx.user.id,
        });
        return { id };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteComment(input.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;

