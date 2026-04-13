import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env["NEXT_PUBLIC_SUPABASE_URL"]!;
const supabaseServiceKey =
  process.env["SUPABASE_SERVICE_ROLE_KEY"] ??
  process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]!;
const adminSetupToken = process.env["ADMIN_SETUP_TOKEN"];

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const { email, setup_token } = body as {
      email?: string;
      setup_token?: string;
    };

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    if (!adminSetupToken || setup_token !== adminSetupToken) {
      return NextResponse.json(
        { error: "Invalid setup token" },
        { status: 403 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: existingAdmins } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "admin");

    if (existingAdmins && existingAdmins.length > 0) {
      return NextResponse.json(
        { error: "An admin account already exists. Use the SQL editor to add more admins." },
        { status: 409 }
      );
    }

    const { data: profile, error: findError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("email", email)
      .single();

    if (findError || !profile) {
      return NextResponse.json(
        { error: "No account found with that email. Sign up first, then run this again." },
        { status: 404 }
      );
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ role: "admin", approved: true, onboarded: true })
      .eq("id", profile.id);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to promote user to admin" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: `Successfully promoted ${email} to admin`,
      user_id: profile.id,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
