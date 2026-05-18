import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/portfolio(.*)", "/account(.*)"]);
const clerkClientConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
const clerkServerConfigured = Boolean(process.env.CLERK_SECRET_KEY);

const middleware = clerkClientConfigured
  ? clerkMiddleware(async (auth, req) => {
      if (clerkServerConfigured && isProtectedRoute(req)) {
        try {
          await auth.protect();
        } catch {
          return NextResponse.redirect(new URL("/sign-in", req.url));
        }
      }
    })
  : () => NextResponse.next();

export default middleware;

export const config = {
  matcher: ["/portfolio(.*)", "/account(.*)"]
};
