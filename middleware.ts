import { type NextRequest, NextResponse } from "next/server"

import { getToken } from "next-auth/jwt"

// Define protected routes and required roles
const protectedRoutes = [
  {
    path: "/admin",
    roles: ["admin"],
  }
]

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname

  // Check if the path is a protected route
  const isProtectedRoute = protectedRoutes.some((route) => path === route.path || path.startsWith(`${route.path}/`))

  if (isProtectedRoute) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

    // If no token, redirect to login
    if (!token) {
      const url = new URL("/api/auth/signin", req.url)

      url.searchParams.set("callbackUrl", encodeURI(req.url))

      return NextResponse.redirect(url)
    }

    // Find the matching protected route config
    const matchedRoute = protectedRoutes.find((route) => path === route.path || path.startsWith(`${route.path}/`))

    // Check if user has the required role
    if (matchedRoute && !matchedRoute.roles.includes(token.role as string)) {
      return NextResponse.redirect(new URL("/unauthorized", req.url))
    }
  }

  return NextResponse.next()
}

// Configure which paths the middleware runs on
export const config = {
  matcher: ["/admin/:path*"],
}
