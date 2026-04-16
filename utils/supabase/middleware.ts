import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import {
  getSessionProfileForUser,
  isAdminRole,
} from "@/lib/auth/session-profile";

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env["NEXT_PUBLIC_SUPABASE_URL"];
  const supabaseAnonKey = process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"];

  if (
    !supabaseUrl ||
    !supabaseAnonKey ||
    supabaseUrl.startsWith("your-")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtected =
    pathname.startsWith("/dashboard") || pathname.startsWith("/admin");

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isProtected) {
    const sessionProfile = await getSessionProfileForUser(supabase, user.id);
    const isAdmin = isAdminRole(sessionProfile?.role);
    const isOnboardingRoute =
      pathname === "/dashboard/onboarding" ||
      pathname.startsWith("/dashboard/onboarding/");

    if (
      isAdmin &&
      pathname.startsWith("/dashboard") &&
      !pathname.startsWith("/admin")
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }

    if (!isAdmin && pathname.startsWith("/dashboard")) {
      const onboarded = Boolean(sessionProfile?.onboarded);

      if (onboarded && isOnboardingRoute) {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
      }

      if (!onboarded && !isOnboardingRoute) {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard/onboarding";
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}
