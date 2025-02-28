import { type NextRequest, NextResponse } from "next/server"

import { getToken } from "next-auth/jwt"

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });

  // If no token, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Extract path from URL
  const { pathname } = req.nextUrl;

  // Check if the user is accessing an admin page
  if (pathname.startsWith("/en/admin") || pathname.startsWith("/fr/admin") || pathname.startsWith("/ar/admin")) {
    if (token.role !== "admin") {
      return NextResponse.redirect(new URL("/pages/misc/401-not-authorized", req.url));
    }
  }

  // else if(pathname.startsWith("/en/device") || pathname.startsWith("/fr/device") || pathname.startsWith("/ar/device")) {
  //   if (token.role !== "admin") {
  //     const parts = pathname.split("/");
  //
  //     if(parts.length > 2) {
  //       if(!isNaN(Number(parts[3]))) {
  //         const deviceId = parts[3]; // "4"
  //
  //         const devices = await getOwnDeviceData();
  //         console.log(devices)
  //
  //       }
  //     }
  //   }
  // }

  return NextResponse.next();
}

// Apply middleware only to admin routes
export const config = {
  matcher: ["/:lang/admin/:path*"],
};
