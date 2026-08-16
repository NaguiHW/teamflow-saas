import type { NextRequest } from "next/server";

const apiBaseUrl = (
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000"
).replace(/\/$/, "");

const forwardRequest = async (request: NextRequest, path: string[]) => {
  const target = new URL(`${apiBaseUrl}/${path.join("/")}`);
  target.search = new URL(request.url).search;

  const headers = new Headers();
  for (const headerName of [
    "accept",
    "authorization",
    "content-type",
    "cookie",
  ]) {
    const value = request.headers.get(headerName);
    if (value) headers.set(headerName, value);
  }

  const body = ["GET", "HEAD"].includes(request.method)
    ? undefined
    : await request.arrayBuffer();
  const response = await fetch(target, {
    method: request.method,
    headers,
    body,
    cache: "no-store",
  });

  const responseHeaders = new Headers();
  const contentType = response.headers.get("content-type");
  const setCookie = response.headers.get("set-cookie");
  if (contentType) responseHeaders.set("content-type", contentType);
  if (setCookie) responseHeaders.set("set-cookie", setCookie);

  return new Response(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
};

type RouteContext = { params: Promise<{ path: string[] }> };

const handleRequest = async (request: NextRequest, context: RouteContext) => {
  const { path } = await context.params;
  return forwardRequest(request, path);
};

export const GET = handleRequest;
export const POST = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
