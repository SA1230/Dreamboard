import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";

export async function GET() {
  const session = await auth();
  if (!session?.user?.googleSub) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("game_data")
    .select("data, updated_at")
    .eq("google_sub", session.user.googleSub)
    .single();

  if (error && error.code === "PGRST116") {
    // No row found — user has no server-side game data yet
    return NextResponse.json({ data: null, updatedAt: null });
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data: data.data,
    updatedAt: data.updated_at,
  });
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.googleSub) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: { data: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.data || typeof body.data !== "object") {
    return NextResponse.json(
      { error: "Missing or invalid 'data' field" },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();
  const supabase = createServiceClient();

  const { error } = await supabase.from("game_data").upsert(
    {
      google_sub: session.user.googleSub,
      data: body.data,
      schema_version: (body.data as Record<string, unknown>).schemaVersion ?? 1,
      updated_at: now,
    },
    { onConflict: "google_sub" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, updatedAt: now });
}
