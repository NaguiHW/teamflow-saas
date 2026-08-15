import type { FastifyInstance, FastifyReply } from "fastify";
import { z } from "zod";
import { ApiError } from "../errors.js";
import { supabase } from "./supabase.js";
import { authenticate } from "./hooks.js";
import { db } from "../db/client.js";
import { userProfiles } from "../db/schema.js";
import { rateLimit } from "../security/rate-limit.js";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  displayName: z.string().trim().min(1).max(100).optional(),
});
const recoverySchema = z.object({ email: z.string().email() });

const setSessionCookies = (
  reply: FastifyReply,
  session: { access_token: string; refresh_token: string },
) => {
  reply.setCookie("teamflow_access_token", session.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  reply.setCookie("teamflow_refresh_token", session.refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
};

const ensureProfile = async (
  id: string,
  email: string,
  displayName?: string,
) => {
  await db
    .insert(userProfiles)
    .values({ id, email, displayName })
    .onConflictDoUpdate({
      target: userProfiles.id,
      set: { email, ...(displayName ? { displayName } : {}) },
    });
};

const authRoutes = async (app: FastifyInstance) => {
  app.post(
    "/auth/register",
    { preHandler: rateLimit("register", 10, 60) },
    async (request, reply) => {
      const input = credentialsSchema.parse(request.body);
      const { data, error } = await supabase.auth.signUp({
        email: input.email,
        password: input.password,
        options: { data: { display_name: input.displayName } },
      });
      if (error || !data.user)
        throw new ApiError(
          400,
          "REGISTRATION_FAILED",
          error?.message ?? "Registration failed.",
        );
      await ensureProfile(data.user.id, input.email, input.displayName);
      if (data.session) setSessionCookies(reply, data.session);
      return reply.code(201).send({
        user: { id: data.user.id, email: input.email },
        authenticated: Boolean(data.session),
      });
    },
  );

  app.post(
    "/auth/login",
    { preHandler: rateLimit("login", 10, 60) },
    async (request, reply) => {
      const input = credentialsSchema
        .pick({ email: true, password: true })
        .parse(request.body);
      const { data, error } = await supabase.auth.signInWithPassword(input);
      if (error || !data.user || !data.session)
        throw new ApiError(401, "LOGIN_FAILED", "Invalid email or password.");
      await ensureProfile(data.user.id, data.user.email ?? input.email);
      setSessionCookies(reply, data.session);
      return {
        user: { id: data.user.id, email: data.user.email },
        authenticated: true,
      };
    },
  );

  app.post(
    "/auth/refresh",
    { preHandler: rateLimit("refresh", 20, 60) },
    async (request, reply) => {
      const refreshToken = request.cookies.teamflow_refresh_token;
      if (!refreshToken)
        throw new ApiError(
          401,
          "INVALID_SESSION",
          "The session is invalid or expired.",
        );
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });
      if (error || !data.session)
        throw new ApiError(
          401,
          "INVALID_SESSION",
          "The session is invalid or expired.",
        );
      setSessionCookies(reply, data.session);
      return { authenticated: true };
    },
  );

  app.post(
    "/auth/logout",
    { preHandler: authenticate },
    async (_request, reply) => {
      await supabase.auth.signOut();
      reply.clearCookie("teamflow_access_token", { path: "/" });
      reply.clearCookie("teamflow_refresh_token", { path: "/" });
      return { authenticated: false };
    },
  );

  app.post(
    "/auth/recovery",
    { preHandler: rateLimit("recovery", 5, 60) },
    async (request) => {
      const input = recoverySchema.parse(request.body);
      await supabase.auth.resetPasswordForEmail(input.email, {
        redirectTo: `${process.env.WEB_ORIGIN ?? "http://localhost:3000"}/recovery`,
      });
      return { accepted: true };
    },
  );

  app.get("/auth/me", { preHandler: authenticate }, async (request) => ({
    user: request.user,
  }));
};

export default authRoutes;
