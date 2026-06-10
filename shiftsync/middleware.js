import { NextResponse } from "next/server";
import * as jose from "jose";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // 1. Grab the token cookie
  const tokenCookie = request.cookies.get("token");
  const token = tokenCookie?.value;

  // 2. Define protected route paths
  // This guards both frontend dashboard views AND backend data APIs
  const isDashboardPage = pathname.startsWith("/dashboard");
  const isProtectedApi = pathname.startsWith("/api/shifts") || 
                          pathname.startsWith("/api/job-profiles") || 
                          pathname.startsWith("/api/study-profiles");

  if (isDashboardPage || isProtectedApi) {
    // If no token exists, lock them out instantly
    if (!token) {
      if (isProtectedApi) {
        return NextResponse.json({ success: false, message: "Unauthorized: No token provided" }, { status: 401 });
      }
      // Redirect frontend users to the login page
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      // Verify the JWT token using the Edge-compatible 'jose' library
      const secretString = process.env.JWT_SECRET || "";
      const encodedSecret = new TextEncoder().encode(secretString);
      
      // This will throw an error automatically if the token is expired or tampered with
      await jose.jwtVerify(token, encodedSecret);

      // Token is valid! Let the request proceed smoothly
      return NextResponse.next();
    } catch (error) {
      console.error("Middleware Auth Validation Failed:", error.message);
      
      // Token is invalid/expired -> Clear it out and force a re-login
      if (isProtectedApi) {
        return NextResponse.json({ success: false, message: "Unauthorized: Invalid or expired token" }, { status: 401 });
      }
      
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("token");
      return response;
    }
  }

  // For non-protected paths (like public landing pages or public assets), pass through
  return NextResponse.next();
}

// 3. Configure the Matcher to optimize performance
// This ensures the middleware only triggers on your core routes, ignoring static images/CSS
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/shifts/:path*",
    "/api/job-profiles/:path*",
    "/api/study-profiles/:path*"
  ],
};