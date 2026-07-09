import Fastify, { type FastifyInstance, type FastifyReply, type FastifyRequest } from "fastify";
import fastifyJwt from "@fastify/jwt";
import { z } from "zod";
import type { Mailer } from "@rpos/email";
import type { JwtPayload } from "@rpos/types";
import { userRoleSchema } from "@rpos/validation";
import { NOTIFICATION_TYPES, render, type NotificationType } from "./templates.js";
import type { NotificationStore, Recipient, StoredNotification } from "./store.js";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: JwtPayload;
    user: JwtPayload;
  }
}

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export interface AppOptions {
  notifications: NotificationStore;
  mailer: Mailer;
  jwtSecret: string;
  /** Shared secret for service-to-service calls (x-internal-secret header). */
  internalSecret: string;
  logger?: boolean;
}

const notifySchema = z
  .object({
    userId: z.string().min(1).optional(),
    role: z.union([userRoleSchema, z.array(userRoleSchema).min(1)]).optional(),
    type: z.enum(NOTIFICATION_TYPES),
    data: z.record(z.unknown()).default({}),
  })
  .refine((value) => Boolean(value.userId) !== Boolean(value.role), {
    message: "Provide exactly one of userId or role",
  });

export function buildApp(options: AppOptions): FastifyInstance {
  const app = Fastify({ logger: options.logger ?? false });
  const { notifications, mailer } = options;

  async function deliverTo(
    userId: string,
    recipient: Recipient,
    type: NotificationType,
    data: Record<string, unknown>,
  ): Promise<StoredNotification> {
    const { subject, body } = render(type, data);
    const notification = await notifications.create({ userId, type, subject, body });
    try {
      await mailer.send({ to: recipient.email, subject, text: body });
      await notifications.markSent(notification.id);
      return { ...notification, status: "SENT" };
    } catch (error) {
      const message = error instanceof Error ? error.message : "delivery failed";
      await notifications.markFailed(notification.id, message);
      // The notification is stored either way; delivery failure is not a caller error.
      return { ...notification, status: "FAILED" };
    }
  }

  app.register(fastifyJwt, { secret: options.jwtSecret });

  app.decorate("authenticate", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch {
      await reply.code(401).send({ error: "UNAUTHORIZED" });
    }
  });

  app.get("/health", async () => ({
    status: "ok" as const,
    service: "notification",
    uptime: process.uptime(),
  }));

  // Service-to-service endpoint: creates the notification(s) and attempts delivery.
  app.post("/v1/notifications", async (request, reply) => {
    if (request.headers["x-internal-secret"] !== options.internalSecret) {
      return reply.code(401).send({ error: "UNAUTHORIZED" });
    }

    const parsed = notifySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        error: "VALIDATION_ERROR",
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const { userId, role, type, data } = parsed.data;

    if (role) {
      const recipients = await notifications.resolveRecipientsByRole(role);
      const delivered = await Promise.all(
        recipients.map((recipient) => deliverTo(recipient.userId, recipient, type, data)),
      );
      return reply.code(201).send({ notifications: delivered });
    }

    const recipient = await notifications.resolveRecipient(userId!);
    if (!recipient) {
      return reply.code(404).send({ error: "RECIPIENT_NOT_FOUND" });
    }

    const notification = await deliverTo(userId!, recipient, type, data);
    return reply.code(201).send({ notification });
  });

  // In-app feed: a user's own notifications.
  app.get("/v1/notifications", { onRequest: [app.authenticate] }, async (request, reply) => {
    const items = await notifications.listByUser(request.user.sub, 50);
    return reply.send({ notifications: items });
  });

  app.post<{ Params: { id: string } }>(
    "/v1/notifications/:id/read",
    { onRequest: [app.authenticate] },
    async (request, reply) => {
      const notification = await notifications.markRead(request.params.id, request.user.sub);
      if (!notification) {
        return reply.code(404).send({ error: "NOT_FOUND" });
      }
      return reply.send({ notification });
    },
  );

  app.post(
    "/v1/notifications/read-all",
    { onRequest: [app.authenticate] },
    async (request, reply) => {
      const updated = await notifications.markAllRead(request.user.sub);
      return reply.send({ updated });
    },
  );

  return app;
}
